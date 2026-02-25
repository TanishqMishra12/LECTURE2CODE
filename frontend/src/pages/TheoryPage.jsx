import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import TableOfContents from "../components/TableOfContents";
import CopyButton from "../components/CopyButton";

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

const mdComponents = {
    h1: ({ node, children, ...props }) => (
        <h1 id={slugify(String(children))} className="text-2xl font-bold text-white mt-8 mb-4 border-b border-surface-600 pb-2" {...props}>
            {children}
        </h1>
    ),
    h2: ({ node, children, ...props }) => (
        <h2 id={slugify(String(children))} className="text-xl font-semibold text-brand-300 mt-6 mb-3" {...props}>
            {children}
        </h2>
    ),
    h3: ({ node, children, ...props }) => (
        <h3 id={slugify(String(children))} className="text-lg font-semibold text-slate-200 mt-5 mb-2" {...props}>
            {children}
        </h3>
    ),
};

export default function TheoryPage() {
    const { theory, loading } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!theory && !loading) navigate("/");
    }, [theory, loading, navigate]);

    if (!theory && !loading) return null;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Theory Page</h1>
                    <p className="text-sm text-slate-500 mt-1">AI-generated lecture breakdown</p>
                </div>
                <CopyButton text={theory} label="Copy as Markdown" size="md" />
            </div>

            {/* Two-column layout */}
            <div className="flex gap-10">
                {/* TOC */}
                <TableOfContents markdown={theory} />

                {/* Main content */}
                <article className="prose-lecture min-w-0 flex-1 animate-slide-up">
                    <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        components={mdComponents}
                    >
                        {theory}
                    </ReactMarkdown>
                </article>
            </div>
        </div>
    );
}
