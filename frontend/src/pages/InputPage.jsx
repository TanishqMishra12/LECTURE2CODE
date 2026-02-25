import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { processInput } from "../api";
import { useApp } from "../context/AppContext";
import { ToastContainer, useToasts } from "../components/Toast";
import Skeleton from "../components/Skeleton";

const MODES = ["url", "transcript"];

export default function InputPage() {
    const navigate = useNavigate();
    const {
        setTheory, setNotebook, setMetadata, setSessionId,
        loading, setLoading,
    } = useApp();

    const [mode, setMode] = useState("url");
    const [urlValue, setUrlValue] = useState("");
    const [transcriptValue, setTranscriptValue] = useState("");
    const { toasts, addToast, removeToast } = useToasts();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const input =
            mode === "url"
                ? { url: urlValue.trim() }
                : { transcript: transcriptValue.trim() };

        try {
            // Clear previous state and prep for stream
            setTheory("");
            setNotebook("");
            setMetadata(null);
            setSessionId(null);
            navigate("/theory");

            import("../api").then(({ streamProcess }) => {
                streamProcess(input, {
                    onTheoryToken: (token) => setTheory((prev) => prev + token),
                    onNotebookToken: (token) => setNotebook((prev) => prev + token),
                    onMetadata: (meta) => setMetadata(meta),
                    onDone: (data) => {
                        setSessionId(data.session_id);
                        setLoading(false);
                    },
                    onError: (err) => {
                        addToast(err.message || "Streaming failed.");
                        setLoading(false);
                    }
                });
            });
        } catch (err) {
            addToast(err.message || "Failed to start processing.");
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-16 animate-fade-in">
            {/* Hero */}
            <div className="mb-12 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl shadow-brand-900/50">
                    <span className="text-2xl font-bold text-white">L2C</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    Lecture<span className="text-brand-400">2</span>Code
                </h1>
                <p className="mt-3 text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                    Transform any coding lecture into a structured theory page and an interactive
                    code notebook — powered by LLMs.
                </p>
            </div>

            {loading ? (
                <Skeleton />
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-surface-600 bg-surface-800 p-6 shadow-2xl shadow-black/30"
                >
                    {/* Mode tabs */}
                    <div className="mb-6 flex rounded-xl bg-surface-700 p-1 gap-1">
                        {MODES.map((m) => (
                            <button
                                key={m}
                                type="button"
                                id={`tab-${m}`}
                                onClick={() => setMode(m)}
                                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === m
                                    ? "bg-brand-600 text-white shadow shadow-brand-900/40"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {m === "url" ? "YouTube URL" : "Paste Transcript"}
                            </button>
                        ))}
                    </div>

                    {/* Input area */}
                    {mode === "url" ? (
                        <div className="mb-6">
                            <label
                                htmlFor="youtube-url"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                YouTube Video URL
                            </label>
                            <input
                                id="youtube-url"
                                type="url"
                                value={urlValue}
                                onChange={(e) => setUrlValue(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                                className="w-full rounded-xl border border-surface-500 bg-surface-700 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none ring-0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                            />
                        </div>
                    ) : (
                        <div className="mb-6">
                            <label
                                htmlFor="transcript-text"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Lecture Transcript
                            </label>
                            <textarea
                                id="transcript-text"
                                value={transcriptValue}
                                onChange={(e) => setTranscriptValue(e.target.value)}
                                placeholder="Paste the full lecture transcript here..."
                                rows={10}
                                required
                                className="w-full resize-y rounded-xl border border-surface-500 bg-surface-700 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none ring-0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 font-mono"
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        id="process-btn"
                        className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:brightness-110 hover:shadow-brand-500/30 active:scale-[0.98]"
                    >
                        Process Lecture
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-500">
                        Processing may take 30 – 90 seconds depending on transcript length and LLM backend.
                    </p>
                </form>
            )}

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
