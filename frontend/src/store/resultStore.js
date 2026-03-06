/**
 * Simple result store — fetches /api/results/:jobId and caches the data.
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const resultCache = {};

export async function fetchResults(jobId) {
    if (resultCache[jobId]) return resultCache[jobId];

    const res = await fetch(`${API_BASE}/api/results/${jobId}`);
    const json = await res.json();

    if (json.success && json.data) {
        resultCache[jobId] = json.data;
        return json.data;
    }

    throw new Error(json.error || "Failed to load results");
}

export function getCachedResult(jobId) {
    return resultCache[jobId] || null;
}
