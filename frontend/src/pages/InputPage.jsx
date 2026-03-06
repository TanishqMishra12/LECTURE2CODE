import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useJobPolling } from "../hooks/useJobPolling";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function InputPage() {
    const [mode, setMode] = useState("youtube"); // youtube | transcript | pdf
    const [url, setUrl] = useState("");
    const [transcript, setTranscript] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [jobId, setJobId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const { status, progress, error: pollError } = useJobPolling(jobId);

    // Redirect to results when done
    if (status === "done" && jobId) {
        navigate(`/results/${jobId}`);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);

        try {
            let res;

            if (mode === "pdf") {
                if (!pdfFile) {
                    setSubmitError("Please select a PDF file.");
                    setSubmitting(false);
                    return;
                }
                // Upload as multipart/form-data
                const formData = new FormData();
                formData.append("file", pdfFile);

                res = await fetch(`${API_BASE}/api/ingest/pdf`, {
                    method: "POST",
                    body: formData,
                });
            } else {
                // JSON body for youtube / transcript
                let body;
                if (mode === "youtube") {
                    body = { source: url, input_type: "youtube" };
                } else {
                    body = { source: transcript, input_type: "transcript", content: transcript };
                }

                res = await fetch(`${API_BASE}/api/ingest`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            }

            const json = await res.json();
            if (json.success && json.data?.jobId) {
                setJobId(json.data.jobId);
            } else {
                setSubmitError(json.error || "Failed to start processing.");
            }
        } catch (err) {
            setSubmitError(err.message);
        }
        setSubmitting(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith(".pdf")) {
                setSubmitError("Only PDF files are accepted.");
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                setSubmitError("PDF file exceeds 20MB limit.");
                return;
            }
            setPdfFile(file);
            setSubmitError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith(".pdf")) {
                setSubmitError("Only PDF files are accepted.");
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                setSubmitError("PDF file exceeds 20MB limit.");
                return;
            }
            setPdfFile(file);
            setSubmitError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const isProcessing = jobId && status && status !== "done" && status !== "error";

    return (
        <div className="min-h-screen bg-bg-page font-body">
            {/* Simple Navbar */}
            <nav className="border-b border-border-light bg-white">
                <div className="max-w-content mx-auto flex items-center justify-between px-10 h-16">
                    <Link to="/" className="text-xl font-heading font-bold text-text-primary tracking-tight">
                        lecture2code
                    </Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-16">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-2 text-center">
                    Process a lecture
                </h1>
                <p className="text-text-secondary text-center mb-10">
                    Paste a YouTube link, drop raw transcript text, or upload a PDF.
                </p>

                {/* Mode tabs */}
                <div className="flex justify-center gap-2 mb-8">
                    {[
                        { id: "youtube", label: "YouTube" },
                        { id: "transcript", label: "Transcript" },
                        { id: "pdf", label: "PDF" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setMode(tab.id); setSubmitError(null); }}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === tab.id
                                ? "bg-accent text-white"
                                : "bg-bg-muted text-text-secondary hover:text-text-primary"
                                }`}
                            disabled={isProcessing}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {mode === "youtube" && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">YouTube URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
                                required
                                disabled={isProcessing}
                            />
                        </div>
                    )}

                    {mode === "transcript" && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">Paste Transcript</label>
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Paste your lecture transcript here..."
                                rows={8}
                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow resize-y"
                                required
                                disabled={isProcessing}
                            />
                        </div>
                    )}

                    {mode === "pdf" && (
                        <div className="mb-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isProcessing}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${pdfFile
                                        ? "border-accent bg-blue-50"
                                        : "border-border-light hover:border-accent"
                                    }`}
                            >
                                {pdfFile ? (
                                    <>
                                        <div className="text-4xl mb-3">✅</div>
                                        <p className="text-sm font-medium text-text-primary mb-1">{pdfFile.name}</p>
                                        <p className="text-xs text-text-muted">
                                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                                            <span className="mx-2">·</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPdfFile(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                                className="text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-4xl mb-3">📄</div>
                                        <p className="text-sm text-text-secondary mb-1">Drop a PDF file here or click to browse</p>
                                        <p className="text-xs text-text-muted">Max 20MB, up to 50 pages</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {submitError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {submitError}
                        </div>
                    )}

                    {status === "error" && pollError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            Processing failed: {pollError}
                        </div>
                    )}

                    {isProcessing && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-text-secondary capitalize">{status}...</span>
                                <span className="text-text-muted font-mono">{progress}%</span>
                            </div>
                            <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || isProcessing || (mode === "pdf" && !pdfFile)}
                        className="w-full bg-accent text-white font-semibold py-3.5 rounded-lg text-base hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? "Processing..." : submitting ? "Starting..." : "Generate Notes & Code"}
                    </button>
                </form>
            </main>
        </div>
    );
}
