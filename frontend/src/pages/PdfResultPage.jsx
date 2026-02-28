import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useApp } from "../context/AppContext";
import { askPdfQuestion } from "../api";
import CopyButton from "../components/CopyButton";
import TableOfContents from "../components/TableOfContents";

const TABS = [
    { key: "summary", label: "Summary" },
    { key: "points", label: "Important Points" },
    { key: "qa", label: "Ask a Question" },
];

export default function PdfResultPage() {
    const { pdfSummary, pdfPoints, pdfSessionId, loading } = useApp();
    const [activeTab, setActiveTab] = useState("summary");
    const [qaHistory, setQaHistory] = useState([]);
    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const chatEndRef = useRef(null);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim() || !pdfSessionId) return;

        const q = question.trim();
        setQuestion("");
        setQaHistory((prev) => [...prev, { role: "user", text: q }]);
        setAsking(true);

        try {
            const data = await askPdfQuestion(pdfSessionId, q);
            setQaHistory((prev) => [...prev, { role: "assistant", text: data.answer }]);
        } catch (err) {
            setQaHistory((prev) => [
                ...prev,
                { role: "assistant", text: `> ⚠️ ${err.message}` },
            ]);
        } finally {
            setAsking(false);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    };

    if (!pdfSummary && !loading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-24 text-center animate-fade-in">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-700 text-3xl">
                    📄
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No PDF Processed Yet</h2>
                <p className="text-slate-400 mb-6">Upload a PDF from the home page to see the summary, important points, and ask questions.</p>
                <a href="/" className="inline-block rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:brightness-110 transition">
                    Go to Upload
                </a>
            </div>
        );
    }

    const renderContent = () => {
        if (activeTab === "summary") {
            return (
                <div className="relative">
                    <CopyButton text={pdfSummary} />
                    <div className="prose-lecture">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                            {pdfSummary}
                        </ReactMarkdown>
                    </div>
                </div>
            );
        }

        if (activeTab === "points") {
            return (
                <div className="relative">
                    <CopyButton text={pdfPoints} />
                    <div className="prose-lecture">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                            {pdfPoints}
                        </ReactMarkdown>
                    </div>
                </div>
            );
        }

        // Q&A tab
        return (
            <div className="flex flex-col h-[calc(100vh-16rem)]">
                {/* Chat history */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {qaHistory.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Ask anything about your PDF</h3>
                            <p className="text-slate-400 text-sm max-w-md mx-auto">
                                Type a question below and get answers based on the content of your uploaded document.
                            </p>
                        </div>
                    )}
                    {qaHistory.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                                        ? "bg-brand-600 text-white rounded-br-md"
                                        : "bg-surface-700 border border-surface-600 text-slate-200 rounded-bl-md"
                                    }`}
                            >
                                {msg.role === "assistant" ? (
                                    <div className="prose-lecture text-sm">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    {asking && (
                        <div className="flex justify-start">
                            <div className="bg-surface-700 border border-surface-600 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-400">
                                <span className="inline-flex gap-1">
                                    <span className="animate-bounce">·</span>
                                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>·</span>
                                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                                </span>{" "}
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleAsk}
                    className="flex gap-3 border-t border-surface-600 pt-4"
                >
                    <input
                        id="qa-input"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about the PDF..."
                        disabled={asking}
                        className="flex-1 rounded-xl border border-surface-500 bg-surface-700 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={asking || !question.trim()}
                        className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                        {asking ? "..." : "Ask"}
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">
                    📄 PDF Analysis
                </h1>
                <p className="text-slate-400 text-sm">
                    Summary, important points, and Q&A from your uploaded document.
                </p>
            </div>

            {/* Tab bar */}
            <div className="mb-8 flex rounded-xl bg-surface-700 p-1 gap-1">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        id={`pdf-tab-${key}`}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === key
                                ? "bg-brand-600 text-white shadow shadow-brand-900/40"
                                : "text-slate-400 hover:text-white"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6 shadow-2xl shadow-black/30">
                {loading && !pdfSummary ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-3 text-slate-400">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing your PDF... This may take a minute.
                        </div>
                    </div>
                ) : (
                    renderContent()
                )}
            </div>
        </div>
    );
}
