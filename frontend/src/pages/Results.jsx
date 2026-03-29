import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchResults } from "../store/resultStore";

export default function Results() {
    const { jobId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("theory");
    const [copied, setCopied] = useState(false);
    const mermaidRef = useRef(null);

    useEffect(() => {
        if (!jobId) return;
        fetchResults(jobId)
            .then(setData)
            .catch((err) => setError(err.message));
    }, [jobId]);

    // Render Mermaid diagram whenever the flowchart tab is active and data is ready
    useEffect(() => {
        if (activeTab !== "flowchart" || !data?.flowchart?.content) return;

        const renderDiagram = async () => {
            try {
                // Mermaid 11 is loaded as an ES module from CDN — grab it from the module registry
                // via dynamic import so we don't have to bundle it.
                const mermaid = (await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")).default;
                mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });

                const el = mermaidRef.current;
                if (!el) return;
                el.removeAttribute("data-processed");
                el.textContent = data.flowchart.content;

                const { svg } = await mermaid.render("flowchart-svg-" + Date.now(), data.flowchart.content);
                el.innerHTML = svg;
            } catch (err) {
                console.error("Mermaid render error:", err);
                if (mermaidRef.current) {
                    mermaidRef.current.innerHTML = `<pre style="color:#ef4444;font-size:12px;white-space:pre-wrap">${data.flowchart.content}</pre>`;
                }
            }
        };

        renderDiagram();
    }, [activeTab, data]);

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-bg-page font-body">
                <nav className="border-b border-border-light bg-white">
                    <div className="max-w-content mx-auto flex items-center justify-between px-10 h-16">
                        <Link to="/" className="text-xl font-heading font-bold text-text-primary tracking-tight">
                            lecture2code
                        </Link>
                    </div>
                </nav>
                <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">Results not found</h1>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <Link to="/app" className="text-accent font-medium hover:underline">← Try another lecture</Link>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-bg-page font-body flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary text-sm">Loading results...</p>
                </div>
            </div>
        );
    }

    const theoryContent = data.theory?.content || "";
    const notebookContent = data.notebook?.content || "";
    const flowchartContent = data.flowchart?.content || "";

    return (
        <div className="min-h-screen bg-bg-page font-body">
            {/* Navbar */}
            <nav className="border-b border-border-light bg-white sticky top-0 z-40">
                <div className="max-w-content mx-auto flex items-center justify-between px-10 h-16">
                    <Link to="/" className="text-xl font-heading font-bold text-text-primary tracking-tight">
                        lecture2code
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/app"
                            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                        >
                            ← New Lecture
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Tab switcher */}
            <div className="border-b border-border-light bg-white">
                <div className="max-w-content mx-auto px-10">
                    <div className="flex gap-1">
                        {[
                            { id: "theory", label: "Theory Notes" },
                            { id: "notebook", label: "Code Notebook" },
                            { id: "flowchart", label: "🗺 Flowchart" },
                            { id: "split", label: "Split View" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                        ? "border-accent text-accent"
                                        : "border-transparent text-text-secondary hover:text-text-primary"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-content mx-auto px-10 py-8">
                {activeTab === "theory" && (
                    <div className="bg-white border border-border-light rounded-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-bold text-text-primary">Theory Notes</h2>
                            <button
                                onClick={() => handleCopy(theoryContent)}
                                className="text-xs text-text-muted border border-border-light px-3 py-1.5 rounded-md hover:bg-bg-muted transition-colors"
                            >
                                {copied ? "✓ Copied" : "Copy"}
                            </button>
                        </div>
                        <div className="prose-lecture" dangerouslySetInnerHTML={{ __html: markdownToHtml(theoryContent) }} />
                    </div>
                )}

                {activeTab === "notebook" && (
                    <div className="bg-white border border-border-light rounded-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-bold text-text-primary">Code Notebook</h2>
                            <button
                                onClick={() => handleCopy(notebookContent)}
                                className="text-xs text-text-muted border border-border-light px-3 py-1.5 rounded-md hover:bg-bg-muted transition-colors"
                            >
                                {copied ? "✓ Copied" : "Copy"}
                            </button>
                        </div>
                        <div className="prose-lecture" dangerouslySetInnerHTML={{ __html: markdownToHtml(notebookContent) }} />
                    </div>
                )}

                {activeTab === "flowchart" && (
                    <div className="bg-white border border-border-light rounded-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-heading font-bold text-text-primary">Concept Flowchart</h2>
                                <p className="text-xs text-text-muted mt-1">Auto-generated visual summary of the key algorithm or process</p>
                            </div>
                            <button
                                onClick={() => handleCopy(flowchartContent)}
                                className="text-xs text-text-muted border border-border-light px-3 py-1.5 rounded-md hover:bg-bg-muted transition-colors"
                            >
                                {copied ? "✓ Copied (Mermaid)" : "Copy Mermaid"}
                            </button>
                        </div>

                        {flowchartContent ? (
                            <div className="flex flex-col items-center">
                                {/* Rendered Mermaid diagram */}
                                <div
                                    ref={mermaidRef}
                                    className="w-full overflow-x-auto flex justify-center py-4"
                                    style={{ minHeight: "200px" }}
                                >
                                    <div className="text-text-muted text-sm animate-pulse">Rendering diagram…</div>
                                </div>

                                {/* Collapsible raw source */}
                                <details className="mt-6 w-full">
                                    <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary select-none">
                                        View Mermaid source
                                    </summary>
                                    <pre className="mt-2 p-4 bg-bg-muted rounded-lg text-xs font-mono text-text-primary overflow-x-auto whitespace-pre-wrap">
                                        {flowchartContent}
                                    </pre>
                                </details>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-text-muted">
                                <div className="text-4xl mb-3">🗺</div>
                                <p className="text-sm">No flowchart available for this result.</p>
                                <p className="text-xs mt-1">Re-process your lecture to generate one.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "split" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-border-light rounded-xl p-6">
                            <h2 className="text-lg font-heading font-bold text-text-primary mb-4">Theory Notes</h2>
                            <div className="prose-lecture text-sm" dangerouslySetInnerHTML={{ __html: markdownToHtml(theoryContent) }} />
                        </div>
                        <div className="bg-white border border-border-light rounded-xl p-6">
                            <h2 className="text-lg font-heading font-bold text-text-primary mb-4">Code Notebook</h2>
                            <div className="prose-lecture text-sm" dangerouslySetInnerHTML={{ __html: markdownToHtml(notebookContent) }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Minimal markdown → HTML converter.
 * Handles headings, paragraphs, bold, code blocks, lists, and tables.
 * For production, use react-markdown — this is a lightweight fallback.
 */
function markdownToHtml(md) {
    if (!md) return "";
    let html = md
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        // Headings
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Tables (simple)
        .replace(/\|(.+)\|/g, (match) => {
            if (match.includes('---')) return '';
            const cells = match.split('|').filter(Boolean).map(c => c.trim());
            const tag = match.includes('**') ? 'th' : 'td';
            return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
        })
        // Unordered lists
        .replace(/^[-*] (.*$)/gm, '<li>$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-3]>)/g, '$1');
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');

    return html;
}
