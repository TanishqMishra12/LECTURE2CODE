const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * POST /process — full JSON response (non-streaming).
 * @param {{ url?: string, transcript?: string }} input
 * @returns {Promise<{ session_id: string, theory: string, notebook: string, metadata: object }>}
 */
export async function processInput(input) {
    const response = await fetch(`${API_URL}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            detail = err?.detail?.message || err?.detail || detail;
        } catch (_) { }
        throw new Error(detail);
    }
    return response.json();
}

/**
 * POST /process/stream — SSE streaming.
 * Calls callbacks as tokens arrive.
 *
 * @param {{ url?: string, transcript?: string }} input
 * @param {{
 *   onTheoryToken: (token: string) => void,
 *   onNotebookToken: (token: string) => void,
 *   onMetadata: (meta: object) => void,
 *   onDone: (data: { session_id: string }) => void,
 *   onError: (err: { code: string, message: string }) => void,
 * }} callbacks
 */
export async function streamProcess(input, callbacks) {
    const response = await fetch(`${API_URL}/process/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            detail = err?.detail?.message || err?.detail || detail;
        } catch (_) { }
        throw new Error(detail);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        let currentEvent = "message";
        for (const line of lines) {
            if (line.startsWith("event:")) {
                currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
                const data = line.slice(5).trim();
                switch (currentEvent) {
                    case "theory_token":
                        callbacks.onTheoryToken?.(data);
                        break;
                    case "notebook_token":
                        callbacks.onNotebookToken?.(data);
                        break;
                    case "theory_replace":
                        callbacks.onTheoryReplace?.(data);
                        break;
                    case "notebook_replace":
                        callbacks.onNotebookReplace?.(data);
                        break;
                    case "metadata":
                        try { callbacks.onMetadata?.(JSON.parse(data)); } catch (_) { }
                        break;
                    case "done":
                        try { callbacks.onDone?.(JSON.parse(data)); } catch (_) { }
                        break;
                    case "error":
                        try { callbacks.onError?.(JSON.parse(data)); } catch (_) { }
                        break;
                }
                currentEvent = "message";
            }
        }
    }
}

/**
 * POST /pdf/process — upload a PDF file for summarisation + important points.
 * @param {File} file
 * @returns {Promise<{ session_id: string, summary: string, points: string, metadata: object }>}
 */
export async function uploadPdf(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/pdf/process`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            detail = err?.detail?.message || err?.detail || detail;
        } catch (_) { }
        throw new Error(detail);
    }
    return response.json();
}

/**
 * POST /pdf/ask — ask a question about an already-processed PDF.
 * @param {string} sessionId
 * @param {string} question
 * @returns {Promise<{ answer: string, processing_time_ms: number }>}
 */
export async function askPdfQuestion(sessionId, question) {
    const response = await fetch(`${API_URL}/pdf/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, question }),
    });

    if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            detail = err?.detail?.message || err?.detail || detail;
        } catch (_) { }
        throw new Error(detail);
    }
    return response.json();
}

/**
 * Build the export URL for a given session ID.
 */
export function exportUrl(sessionId) {
    return `${API_URL}/export/${sessionId}`;
}
