import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { processInput, uploadPdf } from "../api";
import { useApp } from "../context/AppContext";
import { ToastContainer, useToasts } from "../components/Toast";
import Skeleton from "../components/Skeleton";

const MODES = ["url", "transcript", "pdf"];

export default function InputPage() {
    const navigate = useNavigate();
    const {
        setTheory, setNotebook, setMetadata, setSessionId,
        setPdfSummary, setPdfPoints, setPdfSessionId,
        loading, setLoading,
    } = useApp();

    const [mode, setMode] = useState("url");
    const [urlValue, setUrlValue] = useState("");
    const [transcriptValue, setTranscriptValue] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const { toasts, addToast, removeToast } = useToasts();

    // ── Lecture processing (existing flow) ──
    const handleLectureSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const input =
            mode === "url"
                ? { url: urlValue.trim() }
                : { transcript: transcriptValue.trim() };

        try {
            setTheory("");
            setNotebook("");
            setMetadata(null);
            setSessionId(null);
            navigate("/theory");

            import("../api").then(({ streamProcess }) => {
                streamProcess(input, {
                    onTheoryToken: (token) => setTheory((prev) => prev + token),
                    onNotebookToken: (token) => setNotebook((prev) => prev + token),
                    onTheoryReplace: (content) => setTheory(content),
                    onNotebookReplace: (content) => setNotebook(content),
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

    // ── PDF processing (new flow) ──
    const handlePdfSubmit = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
            addToast("Please select a PDF file.");
            return;
        }
        setLoading(true);
        setPdfSummary("");
        setPdfPoints("");
        setPdfSessionId(null);
        navigate("/pdf");

        try {
            const data = await uploadPdf(pdfFile);
            setPdfSummary(data.summary);
            setPdfPoints(data.points);
            setPdfSessionId(data.session_id);
        } catch (err) {
            addToast(err.message || "PDF processing failed.");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    // ── Drag & drop handlers ──
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            addToast("Please drop a PDF file.");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) setPdfFile(file);
    };

    const handleSubmit = mode === "pdf" ? handlePdfSubmit : handleLectureSubmit;

    const modeLabel = (m) => {
        if (m === "url") return "YouTube URL";
        if (m === "transcript") return "Paste Transcript";
        return "Upload PDF";
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
                    code notebook — or upload a PDF for instant summaries &amp; Q&amp;A.
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
                                {modeLabel(m)}
                            </button>
                        ))}
                    </div>

                    {/* Input area */}
                    {mode === "url" && (
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
                    )}

                    {mode === "transcript" && (
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

                    {mode === "pdf" && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Upload PDF
                            </label>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 cursor-pointer transition-all ${isDragging
                                        ? "border-brand-400 bg-brand-900/20"
                                        : pdfFile
                                            ? "border-green-500/50 bg-green-900/10"
                                            : "border-surface-500 bg-surface-700 hover:border-brand-500/50 hover:bg-surface-600"
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="pdf-file-input"
                                />
                                {pdfFile ? (
                                    <>
                                        <div className="text-3xl">✅</div>
                                        <p className="text-sm font-medium text-green-400">
                                            {pdfFile.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(pdfFile.size / 1024 / 1024).toFixed(1)} MB — Click or drop to replace
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-3xl">📄</div>
                                        <p className="text-sm text-slate-400">
                                            <span className="font-medium text-brand-400">Click to browse</span>{" "}
                                            or drag and drop a PDF
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Max 20 MB · PDF files only
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        id="process-btn"
                        disabled={mode === "pdf" && !pdfFile}
                        className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:brightness-110 hover:shadow-brand-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {mode === "pdf" ? "Analyze PDF" : "Process Lecture"}
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-500">
                        {mode === "pdf"
                            ? "PDF analysis may take 30 – 90 seconds depending on document length and LLM backend."
                            : "Processing may take 30 – 90 seconds depending on transcript length and LLM backend."}
                    </p>
                </form>
            )}

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
