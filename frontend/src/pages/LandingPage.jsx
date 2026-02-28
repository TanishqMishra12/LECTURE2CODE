import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPdf } from "../api";
import { useApp } from "../context/AppContext";
import Footer from "../components/Footer";

export default function LandingPage() {
    const navigate = useNavigate();
    const {
        setTheory, setNotebook, setMetadata, setSessionId,
        setPdfSummary, setPdfPoints, setPdfSessionId,
        setLoading,
    } = useApp();

    const [urlValue, setUrlValue] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processingYT, setProcessingYT] = useState(false);
    const [processingPdf, setProcessingPdf] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    // ── Scroll reveal animation ──
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                    }
                });
            },
            { root: null, threshold: 0.05 }
        );
        document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // ── YouTube processing ──
    const handleYoutubeSubmit = async (e) => {
        e.preventDefault();
        if (!urlValue.trim()) return;
        setError("");
        setProcessingYT(true);
        setLoading(true);
        setTheory("");
        setNotebook("");
        setMetadata(null);
        setSessionId(null);
        navigate("/theory");

        try {
            const { streamProcess } = await import("../api");
            streamProcess({ url: urlValue.trim() }, {
                onTheoryToken: (token) => setTheory((prev) => prev + token),
                onNotebookToken: (token) => setNotebook((prev) => prev + token),
                onTheoryReplace: (content) => setTheory(content),
                onNotebookReplace: (content) => setNotebook(content),
                onMetadata: (meta) => setMetadata(meta),
                onDone: (data) => {
                    setSessionId(data.session_id);
                    setLoading(false);
                    setProcessingYT(false);
                },
                onError: (err) => {
                    setError(err.message || "Processing failed.");
                    setLoading(false);
                    setProcessingYT(false);
                },
            });
        } catch (err) {
            setError(err.message || "Failed to start processing.");
            setLoading(false);
            setProcessingYT(false);
        }
    };

    // ── PDF processing ──
    const handlePdfSubmit = async () => {
        if (!pdfFile) return;
        setError("");
        setProcessingPdf(true);
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
            setError(err.message || "PDF processing failed.");
            navigate("/");
        } finally {
            setLoading(false);
            setProcessingPdf(false);
        }
    };

    // ── Drag & drop ──
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            setError("Please drop a PDF file.");
        }
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) { setPdfFile(file); setError(""); }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <main className="flex-1">
                {/* ════════════════════ HERO ════════════════════ */}
                <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-4 md:px-12 py-12 scroll-reveal active">
                    <div className="w-full max-w-6xl terminal-window border border-slate-700 bg-black overflow-hidden">
                        {/* Terminal title bar */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                            <div className="flex gap-2">
                                <div className="size-3 border border-slate-600"></div>
                                <div className="size-3 border border-slate-600"></div>
                                <div className="size-3 border border-slate-600"></div>
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                User@Lecture2Code: ~ /bin/bash
                            </div>
                            <div className="w-12"></div>
                        </div>

                        <div className="p-6 md:p-12 space-y-12">
                            {/* Command + Headline */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <span className="text-sm">root@lecture2code:~$</span>
                                    <span className="text-white">./init_headline.sh</span>
                                </div>
                                <div className="pl-4 md:pl-8 space-y-6">
                                    <h1 className="text-white text-4xl md:text-7xl font-extrabold leading-tight tracking-tighter">
                                        TURN LECTURES <br />INTO <span className="bg-primary text-white px-4">CODE</span>
                                    </h1>
                                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed border-l-2 border-primary/30 pl-6">
                                        Transform YouTube videos and PDFs into structured summaries and executable notebooks in seconds.
                                    </p>
                                </div>
                            </div>

                            {/* Input area */}
                            <div className="space-y-8 pl-4 md:pl-8 max-w-4xl">
                                {/* YouTube URL */}
                                <form onSubmit={handleYoutubeSubmit} className="space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                        <span>$ input_url --source="youtube"</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <input
                                            id="youtube-url-input"
                                            type="url"
                                            value={urlValue}
                                            onChange={(e) => setUrlValue(e.target.value)}
                                            className="flex-1 bg-transparent border-b-2 border-slate-800 focus:border-primary focus:ring-0 focus:outline-none px-0 py-2 text-white placeholder:text-slate-700 font-mono"
                                            placeholder="Paste YouTube link here..."
                                            required
                                        />
                                        <button
                                            type="submit"
                                            id="execute-convert-btn"
                                            disabled={processingYT}
                                            className="bg-primary text-white px-8 py-3 font-bold hover:bg-primary/90 transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingYT ? "Processing..." : "Execute Convert"}
                                        </button>
                                    </div>
                                </form>

                                {/* PDF Upload */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                                        <span>$ upload_file --type="pdf"</span>
                                    </div>
                                    <label
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`group block border-2 border-dashed p-8 transition-colors cursor-pointer text-center ${isDragging
                                                ? "border-primary/80 bg-primary/5"
                                                : pdfFile
                                                    ? "border-emerald-500/50 bg-emerald-900/10"
                                                    : "border-slate-800 hover:border-primary/50"
                                            }`}
                                    >
                                        {pdfFile ? (
                                            <span className="text-emerald-400 text-sm uppercase font-bold tracking-widest">
                                                ✅ {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 group-hover:text-primary text-sm uppercase font-bold tracking-widest">
                                                Drag & Drop PDF to analyze research papers <span className="terminal-cursor"></span>
                                            </span>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="pdf-file-input"
                                        />
                                    </label>
                                    {pdfFile && (
                                        <button
                                            onClick={handlePdfSubmit}
                                            disabled={processingPdf}
                                            id="analyze-pdf-btn"
                                            className="bg-primary text-white px-8 py-3 font-bold hover:bg-primary/90 transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingPdf ? "Analyzing..." : "Analyze PDF"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Error display */}
                            {error && (
                                <div className="pl-4 md:pl-8 text-red-400 text-sm font-bold">
                                    [ERROR] {error}
                                </div>
                            )}

                            {/* Badges */}
                            <div className="pl-4 md:pl-8">
                                <div className="text-xs text-slate-500 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">verified</span> NO ACCOUNT REQUIRED
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">lock</span> 100% ENCRYPTED
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════ FEATURES ════════════════════ */}
                <section className="py-24 border-y border-slate-800 scroll-reveal" id="features">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex flex-col gap-4 mb-20">
                            <div className="text-primary font-bold text-sm tracking-[0.3em] uppercase">--- MODULE: FEATURES ---</div>
                            <h3 className="text-3xl md:text-5xl font-black text-white uppercase">Streamline your technical study flow.</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-800">
                            {/* Feature 1 */}
                            <div className="group flex flex-col gap-8 p-10 border-b md:border-b-0 md:border-r border-slate-800 hover:bg-slate-900/50 transition-all">
                                <div className="text-primary">
                                    <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-white uppercase">Smart Summaries</h4>
                                    <div className="font-mono text-[10px] text-slate-400 mb-2">OUTPUT_LOG: 200 OK</div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Automatic transcript-to-summary conversion. Get the core concepts without watching the full hour.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="group flex flex-col gap-8 p-10 border-b md:border-b-0 md:border-r border-slate-800 hover:bg-slate-900/50 transition-all">
                                <div className="text-primary">
                                    <span className="material-symbols-outlined text-4xl">code_blocks</span>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-white uppercase">Interactive Notebooks</h4>
                                    <div className="font-mono text-[10px] text-slate-400 mb-2">GENERATE: .ipynb</div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Extracted code blocks ready to use in your favorite IDE. We handle the formatting and setup.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="group flex flex-col gap-8 p-10 hover:bg-slate-900/50 transition-all">
                                <div className="text-primary">
                                    <span className="material-symbols-outlined text-4xl">chat_paste_go</span>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-white uppercase">PDF Q&A</h4>
                                    <div className="font-mono text-[10px] text-slate-400 mb-2">VECTOR_SEARCH: Active</div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Upload research papers and ask questions directly to the document. Complex citations made easy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════ PREVIEW / IDE ════════════════════ */}
                <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 scroll-reveal" id="preview">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase mb-6">Full-Powered Learning Hub</h2>
                        <p className="text-slate-400 text-lg border-l-4 border-slate-800 pl-6">
                            A workspace designed for builders, not just watchers.
                        </p>
                    </div>

                    <div className="border border-slate-800 shadow-2xl bg-black">
                        {/* IDE title bar */}
                        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                            <div className="flex gap-6">
                                <div className="flex gap-2">
                                    <div className="size-3 rounded-full bg-red-500/50"></div>
                                    <div className="size-3 rounded-full bg-amber-500/50"></div>
                                    <div className="size-3 rounded-full bg-emerald-500/50"></div>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                                    <span className="text-primary border-b border-primary pb-1">LEARNING_ENVIRONMENT.PY</span>
                                    <span className="hover:text-slate-600 transition-colors cursor-pointer">TRANSCRIPT.TXT</span>
                                    <span className="hover:text-slate-600 transition-colors cursor-pointer">SUMMARY.MD</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex h-[600px]">
                            {/* Sidebar */}
                            <div className="hidden lg:flex flex-col w-48 border-r border-slate-800 p-4 space-y-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Explorer</div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="material-symbols-outlined text-[16px]">folder</span> project_src
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white pl-4">
                                    <span className="material-symbols-outlined text-[16px] text-primary">description</span> lecture_data.csv
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white pl-4 font-bold border-l border-primary">
                                    <span className="material-symbols-outlined text-[16px] text-primary">terminal</span> main.ipynb
                                </div>
                            </div>

                            {/* Code area */}
                            <div className="flex-1 p-8 overflow-auto font-mono text-sm leading-relaxed bg-black">
                                <div className="space-y-4">
                                    <div className="text-slate-400 italic"># Initialize AI transformation protocol</div>
                                    <CodeLine num="1"><span className="text-primary font-bold">from</span> lecture2code <span className="text-primary font-bold">import</span> Engine</CodeLine>
                                    <CodeLine num="2"><span className="text-primary font-bold">import</span> pandas <span className="text-primary font-bold">as</span> pd</CodeLine>
                                    <CodeLine num="3">&nbsp;</CodeLine>
                                    <CodeLine num="4">model = Engine.load_model(<span className="text-emerald-500">'transformer-v4'</span>)</CodeLine>
                                    <CodeLine num="5">data = model.process(<span className="text-emerald-500">"https://youtube.com/watch?v=..."</span>)</CodeLine>
                                    <CodeLine num="6">&nbsp;</CodeLine>
                                    <CodeLine num="7"><span className="text-primary font-bold">print</span>(data.summary)</CodeLine>

                                    {/* Terminal output */}
                                    <div className="mt-8 p-6 bg-slate-900 border border-slate-800 text-xs">
                                        <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase tracking-tighter font-bold">
                                            <span className="material-symbols-outlined text-[14px]">output</span> TERMINAL OUTPUT
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-emerald-500 font-bold">[SUCCESS] Transcript parsed: 4,502 tokens</div>
                                            <div className="text-slate-300">SUMMARY: This lecture covers the fundamentals of Neural Networks...</div>
                                            <div className="text-slate-300">CODE BLOCKS: 3 segments extracted for Notebook export.</div>
                                            <div className="mt-2 text-white underline cursor-pointer hover:text-primary transition-colors">
                                                &gt; VIEW INTERACTIVE DASHBOARD
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════ CTA ════════════════════ */}
                <section className="py-32 px-6 md:px-12 text-center bg-slate-900 text-white scroll-reveal overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none dot-grid-bg"></div>
                    <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">Ready to code faster?</h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium">
                            Join thousands of students and engineers turning raw content into executable knowledge.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                            <a
                                href="#hero"
                                className="w-full md:w-auto bg-primary text-white px-12 py-5 font-bold hover:brightness-110 transition-all text-lg shadow-[0_0_30px_rgba(23,23,207,0.4)] text-center"
                            >
                                CMD: START_TRIAL
                            </a>
                            <a
                                href="#preview"
                                className="w-full md:w-auto border-2 border-slate-700 bg-transparent text-white px-12 py-5 font-bold hover:border-white transition-all text-lg uppercase text-center"
                            >
                                VIEW_EXAMPLES
                            </a>
                        </div>
                        <div className="pt-10 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                            <span>NO CREDIT CARD REQUIRED</span>
                            <span>INSTANT PROCESSING</span>
                            <span>100% SECURE</span>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

/* ── Tiny helper for code lines ── */
function CodeLine({ num, children }) {
    return (
        <div className="flex gap-4">
            <span className="text-slate-300 select-none w-4 text-right">{num}</span>
            <span>{children}</span>
        </div>
    );
}
