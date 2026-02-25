import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/atom-one-dark.css";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CopyButton from "../components/CopyButton";
import { exportUrl } from "../api";

const ENABLE_EXPORT = import.meta.env.VITE_ENABLE_EXPORT !== "false";

// Custom renderer for code blocks: adds per-block copy button
function CodeBlock({ className, children }) {
    const code = String(children).trimEnd();
    return (
        <div className="relative group my-5">
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <CopyButton text={code} size="xs" />
            </div>
            <pre className="rounded-xl bg-surface-800 border border-surface-600 overflow-auto">
                <code className={`block p-5 text-sm font-mono leading-relaxed ${className ?? ""}`}>
                    {children}
                </code>
            </pre>
        </div>
    );
}

const mdComponents = {
    code({ node, inline, className, children, ...props }) {
        if (inline) {
            return (
                <code className="bg-surface-700 text-brand-300 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                    {children}
                </code>
            );
        }
        return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
    },
    h1: ({ children }) => (
        <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-surface-600 pb-2">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-xl font-semibold text-brand-300 mt-6 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-lg font-semibold text-slate-200 mt-5 mb-2">{children}</h3>
    ),
    table: ({ children }) => (
        <div className="overflow-x-auto my-5">
            <table className="w-full text-sm border-collapse">{children}</table>
        </div>
    ),
    th: ({ children }) => (
        <th className="bg-surface-700 text-brand-300 font-semibold text-left px-4 py-2 border border-surface-500">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-2 border border-surface-600 text-slate-300">{children}</td>
    ),
    details: ({ children }) => (
        <details className="border border-surface-600 rounded-lg mb-4 overflow-hidden">{children}</details>
    ),
    summary: ({ children }) => (
        <summary className="cursor-pointer px-4 py-2 bg-surface-700 text-brand-300 font-medium hover:bg-surface-600 transition-colors select-none">
            {children}
        </summary>
    ),
};

export default function NotebookPage() {
    const { notebook, sessionId, loading } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!notebook && !loading) navigate("/");
    }, [notebook, loading, navigate]);

    if (!notebook && !loading) return null;

    const handleExport = () => {
        if (sessionId) window.open(exportUrl(sessionId), "_blank");
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
            {/* Page header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notebook</h1>
                    <p className="text-sm text-slate-500 mt-1">Interactive code implementations and practice</p>
                </div>
                <div className="flex items-center gap-3">
                    <CopyButton text={notebook} label="Copy Markdown" size="md" />
                    {ENABLE_EXPORT && sessionId && (
                        <button
                            id="export-btn"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 rounded-xl border border-brand-600/50 bg-brand-600/10 px-4 py-2 text-sm font-medium text-brand-300 transition hover:bg-brand-600/20 hover:text-brand-200"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M8 2v8m0 0-3-3m3 3 3-3M3 13h10" />
                            </svg>
                            Export .ipynb
                        </button>
                    )}
                </div>
            </div>

            {/* Notebook content */}
            <article className="prose-lecture min-w-0 animate-slide-up">
                <ReactMarkdown
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={mdComponents}
                >
                    {notebook}
                </ReactMarkdown>
            </article>
        </div>
    );
}
