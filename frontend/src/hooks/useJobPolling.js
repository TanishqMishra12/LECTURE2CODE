import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Poll GET /api/status/:jobId every 2 seconds.
 * Stops automatically when status is "done" or "error".
 */
export function useJobPolling(jobId) {
    const [status, setStatus] = useState(null); // pending | extracting | processing | done | error
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const poll = useCallback(async () => {
        if (!jobId) return;
        try {
            const res = await fetch(`${API_BASE}/api/status/${jobId}`);
            const json = await res.json();
            if (json.success && json.data) {
                setStatus(json.data.status);
                setProgress(json.data.progress);
                if (json.data.error) setError(json.data.error);
            }
        } catch (err) {
            setError(err.message);
        }
    }, [jobId]);

    useEffect(() => {
        if (!jobId) return;

        // Initial poll
        poll();

        const interval = setInterval(() => {
            // Stop polling if done or error
            if (status === "done" || status === "error") {
                clearInterval(interval);
                return;
            }
            poll();
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId, status, poll]);

    return { status, progress, error };
}
