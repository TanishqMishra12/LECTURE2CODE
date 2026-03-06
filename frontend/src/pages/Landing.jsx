import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — Framer-style, all sub-components in one file
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Navbar ────────────────────────────────────────────────────────────────
function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-sm border-b border-border-light" : ""
                }`}
        >
            <div className="max-w-content mx-auto flex items-center justify-between px-10 md:px-10 h-16">
                <Link to="/" className="text-xl font-heading font-bold text-text-primary tracking-tight">
                    lecture2code
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                    <a href="#features" className="hover:text-text-primary transition-colors">How it works</a>
                    <a href="#bento" className="hover:text-text-primary transition-colors">Features</a>
                    <a href="#testimonials" className="hover:text-text-primary transition-colors">Use cases</a>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden md:inline-flex text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-2">
                        Log in
                    </button>
                    <Link
                        to="/app"
                        className="text-sm font-semibold bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// ─── Hero Section ──────────────────────────────────────────────────────────
function HeroSection() {
    return (
        <section className="section-padding pt-32 md:pt-40 pb-8 md:pb-16">
            <div className="max-w-content mx-auto text-center">
                <h1
                    className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-text-primary leading-[1.08] tracking-tight mb-6 opacity-0 animate-fade-up"
                    style={{ animationDelay: "100ms" }}
                >
                    Turn any lecture into
                    <br />
                    <span className="text-accent">theory notes & code</span>
                </h1>
                <p
                    className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up"
                    style={{ animationDelay: "200ms" }}
                >
                    Paste a YouTube link, upload a PDF, or drop a transcript — get structured study notes and a runnable code notebook in seconds.
                </p>
                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-up"
                    style={{ animationDelay: "300ms" }}
                >
                    <Link
                        to="/app"
                        className="bg-accent text-white font-semibold px-8 py-3.5 rounded-lg text-base hover:bg-accent-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Get Started Free
                    </Link>
                    <a
                        href="#features"
                        className="text-text-secondary font-medium px-6 py-3.5 rounded-lg text-base border border-border-light hover:border-border-muted hover:text-text-primary transition-all duration-200 hover:-translate-y-0.5"
                    >
                        See how it works →
                    </a>
                </div>

                {/* Browser mockup */}
                <div
                    className="max-w-4xl mx-auto opacity-0 animate-fade-up"
                    style={{ animationDelay: "500ms" }}
                >
                    <BrowserMockup />
                </div>
            </div>
        </section>
    );
}

// ─── Browser Mockup ────────────────────────────────────────────────────────
function BrowserMockup() {
    return (
        <div className="rounded-xl border border-border-light shadow-2xl overflow-hidden bg-white">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-bg-muted border-b border-border-light">
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md px-4 py-1.5 text-xs text-text-muted border border-border-light text-center max-w-xs mx-auto">
                        lecture2code.app/results
                    </div>
                </div>
            </div>

            {/* Split-panel content */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-light">
                {/* Theory Panel */}
                <div className="p-6 text-left">
                    <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
                        Theory Notes
                    </div>
                    <h3 className="font-heading font-bold text-text-primary text-lg mb-3">
                        Binary Search — Concept Overview
                    </h3>
                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        Binary search is an efficient algorithm for finding a target value within a sorted array. It works by repeatedly dividing the search interval in half.
                    </p>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-accent rounded">KEY</span>
                            <span className="text-sm text-text-secondary">Time complexity is O(log n), making it much faster than linear search for large datasets.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 rounded">EXAM</span>
                            <span className="text-sm text-text-secondary">Array must be sorted before applying binary search.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-500 rounded">STUCK</span>
                            <span className="text-sm text-text-secondary">Common mistake: using mid = (low + high) / 2 causes integer overflow.</span>
                        </div>
                    </div>
                    <div className="bg-bg-muted rounded-lg p-3">
                        <div className="text-xs font-semibold text-text-muted mb-2">Complexity</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-text-muted">Time</span><br /><span className="font-mono font-semibold text-text-primary">O(log n)</span></div>
                            <div><span className="text-text-muted">Space</span><br /><span className="font-mono font-semibold text-text-primary">O(1)</span></div>
                            <div><span className="text-text-muted">Optimized</span><br /><span className="font-mono font-semibold text-accent">O(log n)</span></div>
                        </div>
                    </div>
                </div>

                {/* Code Panel */}
                <div className="p-6 text-left">
                    <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
                        Code Notebook
                    </div>
                    <div className="bg-[#1e1e2e] rounded-lg p-4 mb-4 overflow-hidden">
                        <pre className="text-sm font-mono text-green-300 leading-relaxed whitespace-pre">
                            {`def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`}
                        </pre>
                    </div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Dry Run Trace
                    </div>
                    <div className="bg-bg-muted rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border-light">
                                    <th className="text-left px-3 py-2 text-accent font-semibold">Step</th>
                                    <th className="text-left px-3 py-2 text-accent font-semibold">State</th>
                                    <th className="text-left px-3 py-2 text-accent font-semibold">Note</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-secondary">
                                <tr className="border-b border-border-muted"><td className="px-3 py-1.5">1</td><td className="px-3 py-1.5 font-mono">low=0, high=7</td><td className="px-3 py-1.5">Initialize</td></tr>
                                <tr className="border-b border-border-muted"><td className="px-3 py-1.5">2</td><td className="px-3 py-1.5 font-mono">mid=3, arr[3]=5</td><td className="px-3 py-1.5">Too small</td></tr>
                                <tr><td className="px-3 py-1.5">3</td><td className="px-3 py-1.5 font-mono">low=4, mid=5</td><td className="px-3 py-1.5">Found!</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Practice Problems
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-text-secondary bg-bg-muted rounded-md px-3 py-2">
                            <span className="text-green-500 text-xs font-bold">Easy</span>
                            <span>Search in sorted array</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary bg-bg-muted rounded-md px-3 py-2">
                            <span className="text-amber-500 text-xs font-bold">Med</span>
                            <span>First & last position of target</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Feature Tabs ──────────────────────────────────────────────────────────
const FEATURE_TABS = [
    {
        id: "theory",
        label: "Theory Notes",
        desc: "Structured concept notes with key points, exam tips, and complexity analysis.",
        content: (
            <div className="p-8 md:p-12">
                <div className="max-w-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-blue-50 text-accent rounded">KEY</span>
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-amber-50 text-amber-600 rounded">EXAM</span>
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-red-50 text-red-500 rounded">STUCK</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-text-primary mb-2">Concept Overview</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                        Each tagged row distills what matters — key facts, exam-critical details, and common stuck points — so you never miss what your professor emphasized.
                    </p>
                    <div className="bg-bg-muted rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-accent rounded shrink-0">KEY</span>
                            <span className="text-sm text-text-secondary">Binary search reduces the search space by half each iteration, giving O(log n) performance.</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 rounded shrink-0">EXAM</span>
                            <span className="text-sm text-text-secondary">Know the difference between iterative and recursive implementations.</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "code",
        label: "Code Notebook",
        desc: "Clean, commented code with dry-run trace table and edge case analysis.",
        content: (
            <div className="p-8 md:p-12">
                <div className="max-w-lg">
                    <h3 className="font-heading font-bold text-xl text-text-primary mb-2">Implementation & Trace</h3>
                    <p className="text-text-secondary text-sm mb-4">
                        Production-quality code with line-by-line comments, plus a step-by-step dry-run table to see exactly how variables change.
                    </p>
                    <div className="bg-[#1e1e2e] rounded-lg p-4 mb-3 overflow-hidden">
                        <pre className="text-sm font-mono text-green-300 leading-relaxed whitespace-pre">
                            {`def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`}
                        </pre>
                    </div>
                    <div className="bg-bg-muted rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border-light">
                                    <th className="text-left px-3 py-2 text-accent font-semibold">Step</th>
                                    <th className="text-left px-3 py-2 text-accent font-semibold">Variables</th>
                                    <th className="text-left px-3 py-2 text-accent font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-secondary">
                                <tr className="border-b border-border-muted"><td className="px-3 py-1.5">1</td><td className="px-3 py-1.5 font-mono">arr=[3,1,4,1]</td><td className="px-3 py-1.5">Split</td></tr>
                                <tr><td className="px-3 py-1.5">2</td><td className="px-3 py-1.5 font-mono">left=[3,1]</td><td className="px-3 py-1.5">Recurse</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "exam",
        label: "Exam Tips",
        desc: "Auto-generated revision checklist with must-know facts and common mistakes.",
        content: (
            <div className="p-8 md:p-12">
                <div className="max-w-lg">
                    <h3 className="font-heading font-bold text-xl text-text-primary mb-2">Smart Exam Prep</h3>
                    <p className="text-text-secondary text-sm mb-4">
                        The AI flags exactly what your professor emphasized in class, turning 2-hour revision into a 30-minute checklist.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4">
                            <span className="text-amber-600 text-lg">⚠️</span>
                            <div>
                                <div className="text-sm font-semibold text-text-primary mb-0.5">Common Mistake</div>
                                <div className="text-sm text-text-secondary">Using mid = (low + high) / 2 can cause integer overflow in some languages. Use mid = low + (high - low) / 2 instead.</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
                            <span className="text-accent text-lg">💡</span>
                            <div>
                                <div className="text-sm font-semibold text-text-primary mb-0.5">Must Know</div>
                                <div className="text-sm text-text-secondary">Binary search requires the array to be sorted. Always verify sorting before applying.</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4">
                            <span className="text-green-600 text-lg">✅</span>
                            <div>
                                <div className="text-sm font-semibold text-text-primary mb-0.5">Quick Check</div>
                                <div className="text-sm text-text-secondary">Can you explain the difference between iterative and recursive binary search?</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "practice",
        label: "Practice Problems",
        desc: "Graded problems with hidden solutions to test your understanding.",
        content: (
            <div className="p-8 md:p-12">
                <div className="max-w-lg">
                    <h3 className="font-heading font-bold text-xl text-text-primary mb-2">Practice & Self-Test</h3>
                    <p className="text-text-secondary text-sm mb-4">
                        3 problems per lecture — Easy, Medium, Hard — each with a hidden solution you can reveal when ready.
                    </p>
                    <div className="space-y-3">
                        <div className="border border-border-light rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 text-xs font-bold bg-green-50 text-green-600 rounded">Easy</span>
                                <span className="text-sm font-semibold text-text-primary">Search in Sorted Array</span>
                            </div>
                            <p className="text-sm text-text-secondary mb-2">Given a sorted array and a target, return the index or -1.</p>
                            <div className="text-xs font-mono text-text-muted bg-bg-muted px-3 py-1.5 rounded">Input: [1,3,5,7,9], target=5 → Output: 2</div>
                        </div>
                        <div className="border border-border-light rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 text-xs font-bold bg-amber-50 text-amber-600 rounded">Medium</span>
                                <span className="text-sm font-semibold text-text-primary">First & Last Position</span>
                            </div>
                            <p className="text-sm text-text-secondary mb-2">Find the starting and ending position of a target value.</p>
                            <div className="text-xs font-mono text-text-muted bg-bg-muted px-3 py-1.5 rounded">Input: [5,7,7,8,8,10], target=8 → Output: [3,4]</div>
                        </div>
                        <div className="border border-border-light rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-500 rounded">Hard</span>
                                <span className="text-sm font-semibold text-text-primary">Search in Rotated Array</span>
                            </div>
                            <p className="text-sm text-text-secondary">Find the target in a rotated sorted array in O(log n).</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
];

function FeatureTabs() {
    const [active, setActive] = useState(0);
    const [fade, setFade] = useState(true);

    const handleTabChange = (i) => {
        if (i === active) return;
        setFade(false);
        setTimeout(() => {
            setActive(i);
            setFade(true);
        }, 100);
    };

    return (
        <section id="features" className="section-padding bg-white">
            <div className="max-w-content mx-auto">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary text-center mb-3">
                    What you get
                </h2>
                <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
                    Every lecture processed through Lecture2Code produces four interconnected outputs.
                </p>

                {/* Tab row */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {FEATURE_TABS.map((tab, i) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(i)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active === i
                                    ? "bg-accent text-white shadow-md"
                                    : "bg-bg-muted text-text-secondary hover:text-text-primary hover:bg-border-muted"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <p className="text-sm text-text-muted text-center mb-6">
                    {FEATURE_TABS[active].desc}
                </p>

                {/* Content area — fixed height */}
                <div className="bg-bg-muted rounded-2xl border border-border-light overflow-hidden min-h-[400px]">
                    <div
                        className={`transition-all duration-200 ease-out ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            }`}
                    >
                        {FEATURE_TABS[active].content}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Bento Grid ────────────────────────────────────────────────────────────
const BENTO_CARDS = [
    {
        title: "YouTube Input",
        desc: "Paste any lecture video URL — we auto-fetch the transcript.",
        span: "md:col-span-1",
        preview: (
            <div className="bg-bg-muted rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-500 text-sm">▶</div>
                    <div className="flex-1 bg-white border border-border-light rounded px-3 py-1.5 text-xs text-text-muted truncate">
                        youtube.com/watch?v=...
                    </div>
                </div>
                <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full w-3/4 transition-all" />
                </div>
            </div>
        ),
    },
    {
        title: "PDF Upload",
        desc: "Upload lecture slides or notes — we extract and process the text.",
        span: "md:col-span-1",
        preview: (
            <div className="bg-bg-muted rounded-lg p-3 mb-4">
                <div className="border-2 border-dashed border-border-light rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-xs text-text-muted">Drop PDF here</div>
                </div>
            </div>
        ),
    },
    {
        title: "Transcript Paste",
        desc: "Have raw notes? Paste them directly and hit go.",
        span: "md:col-span-1",
        preview: (
            <div className="bg-bg-muted rounded-lg p-3 mb-4">
                <div className="bg-white border border-border-light rounded-lg p-3 text-xs text-text-muted font-mono leading-relaxed">
                    Today we'll cover binary search.<br />The key idea is divide and conquer...
                </div>
            </div>
        ),
    },
    {
        title: "Exam Tips Output",
        desc: "Auto-flagged must-know facts, common mistakes, and revision checklist.",
        span: "md:col-span-1",
        preview: (
            <div className="bg-bg-muted rounded-lg p-3 mb-4 space-y-1.5">
                <div className="flex items-center gap-2 bg-amber-50 rounded px-2 py-1.5 text-xs"><span>⚠️</span><span className="text-text-secondary">Integer overflow in mid calc</span></div>
                <div className="flex items-center gap-2 bg-blue-50 rounded px-2 py-1.5 text-xs"><span>💡</span><span className="text-text-secondary">Must be sorted first</span></div>
                <div className="flex items-center gap-2 bg-green-50 rounded px-2 py-1.5 text-xs"><span>✅</span><span className="text-text-secondary">Know iterative vs recursive</span></div>
            </div>
        ),
    },
    {
        title: "Practice Problems",
        desc: "Graded problems with hidden solutions — Easy, Medium, Hard.",
        span: "md:col-span-1",
        preview: (
            <div className="bg-bg-muted rounded-lg p-3 mb-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs"><span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-bold">E</span><span className="text-text-secondary">Search in sorted array</span></div>
                <div className="flex items-center gap-2 text-xs"><span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded font-bold">M</span><span className="text-text-secondary">First & last position</span></div>
                <div className="flex items-center gap-2 text-xs"><span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-bold">H</span><span className="text-text-secondary">Search rotated array</span></div>
            </div>
        ),
    },
    {
        title: "Complexity Table",
        desc: "Time & space complexity for every algorithm, auto-extracted.",
        span: "md:col-span-1",
        preview: (
            <div className="bg-bg-muted rounded-lg p-3 mb-4 overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border-light">
                            <th className="text-left px-2 py-1 text-accent font-semibold">Op</th>
                            <th className="text-left px-2 py-1 text-accent font-semibold">Time</th>
                            <th className="text-left px-2 py-1 text-accent font-semibold">Space</th>
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        <tr className="border-b border-border-muted"><td className="px-2 py-1">Search</td><td className="px-2 py-1 font-mono">O(log n)</td><td className="px-2 py-1 font-mono">O(1)</td></tr>
                        <tr><td className="px-2 py-1">Sort</td><td className="px-2 py-1 font-mono">O(n log n)</td><td className="px-2 py-1 font-mono">O(n)</td></tr>
                    </tbody>
                </table>
            </div>
        ),
    },
];

function BentoGrid() {
    const cardRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("opacity-100", "translate-y-0");
                        entry.target.classList.remove("opacity-0", "translate-y-6");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        cardRefs.current.forEach((ref, i) => {
            if (ref) {
                ref.style.transitionDelay = `${i * 80}ms`;
                observer.observe(ref);
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section id="bento" className="section-padding">
            <div className="max-w-content mx-auto">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary text-center mb-3">
                    Everything in one place
                </h2>
                <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
                    Six powerful features that work together to transform how you study.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {BENTO_CARDS.map((card, i) => (
                        <div
                            key={card.title}
                            ref={(el) => (cardRefs.current[i] = el)}
                            className={`${card.span} bg-white border border-border-light rounded-2xl p-6 opacity-0 translate-y-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg cursor-default`}
                        >
                            {card.preview}
                            <h3 className="font-heading font-bold text-text-primary mb-1">{card.title}</h3>
                            <p className="text-sm text-text-secondary">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Testimonial Strip ────────────────────────────────────────────────────
const TESTIMONIALS = [
    { quote: "Saved me 3 hours of note-taking for every systems lecture.", name: "Anika Sharma", uni: "IIT Delhi" },
    { quote: "The dry-run tables are genuinely better than my professor's.", name: "Marcus Chen", uni: "UC Berkeley" },
    { quote: "I went from C+ to A in Data Structures using this tool.", name: "Priya Patel", uni: "NIT Trichy" },
    { quote: "Paste YouTube link, get notes. It's that simple.", name: "James Okonkwo", uni: "University of Lagos" },
    { quote: "The practice problems are generated at exactly the right difficulty.", name: "Sofia Rodriguez", uni: "Stanford" },
    { quote: "Finally a tool that understands what professors actually emphasize.", name: "Kai Tanaka", uni: "University of Tokyo" },
    { quote: "Complexity tables auto-generated for every algorithm? Sign me up.", name: "Elena Petrova", uni: "ETH Zurich" },
    { quote: "This is the study tool I wish I had in first year.", name: "David Kim", uni: "MIT" },
];

function TestimonialStrip() {
    const row1 = TESTIMONIALS.slice(0, 4);
    const row2 = TESTIMONIALS.slice(4, 8);

    return (
        <section id="testimonials" className="py-20 bg-bg-muted overflow-hidden">
            <div className="max-w-content mx-auto px-10 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-3">
                    Loved by students worldwide
                </h2>
                <p className="text-text-secondary">Join thousands of students who study smarter, not harder.</p>
            </div>

            {/* Row 1 — scrolls left */}
            <div className="relative mb-4">
                <div className="flex animate-scroll-left gap-4" style={{ width: "max-content" }}>
                    {[...row1, ...row1].map((t, i) => (
                        <TestimonialCard key={`r1-${i}`} {...t} />
                    ))}
                </div>
            </div>

            {/* Row 2 — scrolls right */}
            <div className="relative">
                <div className="flex animate-scroll-right gap-4" style={{ width: "max-content" }}>
                    {[...row2, ...row2].map((t, i) => (
                        <TestimonialCard key={`r2-${i}`} {...t} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ quote, name, uni }) {
    return (
        <div className="w-[340px] shrink-0 bg-white border border-border-light rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200">
            <p className="text-sm text-text-secondary mb-3 leading-relaxed">"{quote}"</p>
            <div className="text-sm">
                <span className="font-semibold text-text-primary">{name}</span>
                <span className="text-text-muted"> · {uni}</span>
            </div>
        </div>
    );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────
const STATS = [
    { value: 2, suffix: " hrs", label: "saved per lecture" },
    { value: 30, suffix: "s", prefix: "~", label: "processing time" },
    { value: 3, suffix: "×", label: "faster exam prep" },
    { value: null, text: "Any", label: "coding language" },
];

function StatsBar() {
    const ref = useRef(null);
    const [counts, setCounts] = useState(STATS.map(() => 0));
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    // Animate each stat
                    STATS.forEach((stat, i) => {
                        if (stat.value === null) return;
                        const target = stat.value;
                        const duration = 1200;
                        const start = performance.now();

                        const tick = (now) => {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            setCounts((prev) => {
                                const next = [...prev];
                                next[i] = Math.round(eased * target);
                                return next;
                            });
                            if (progress < 1) requestAnimationFrame(tick);
                        };
                        requestAnimationFrame(tick);
                    });
                    observer.unobserve(el);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="bg-white border-y border-border-light">
            <div className="max-w-content mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border-light">
                {STATS.map((stat, i) => (
                    <div key={stat.label} className="py-12 px-6 text-center">
                        <div className="text-3xl md:text-4xl font-heading font-extrabold text-text-primary mb-1">
                            {stat.prefix || ""}
                            {stat.value === null ? stat.text : counts[i]}
                            {stat.value !== null ? stat.suffix : ""}
                        </div>
                        <div className="text-sm text-text-muted">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────
function FinalCTA() {
    return (
        <section className="section-padding">
            <div className="max-w-content mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4 leading-tight">
                    Your next lecture is
                    <br />
                    already waiting.
                </h2>
                <p className="text-text-secondary mb-8 max-w-lg mx-auto">
                    Stop pausing, rewinding, and scribbling notes. Let AI do the heavy lifting so you can focus on understanding.
                </p>
                <Link
                    to="/app"
                    className="inline-block bg-accent text-white font-semibold px-10 py-4 rounded-lg text-lg hover:bg-accent-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                    Get Started Free
                </Link>
                <p className="text-sm text-text-muted mt-4">No account needed. Works instantly.</p>
            </div>
        </section>
    );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function LandingFooter() {
    return (
        <footer className="border-t border-border-light py-8">
            <div className="max-w-content mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <span className="font-heading font-bold text-text-primary">lecture2code</span>
                    <span className="text-text-muted text-sm ml-2">Turn lectures into understanding.</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-text-secondary">
                    <a href="https://github.com" className="hover:text-text-primary transition-colors">GitHub</a>
                    <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
                    <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                </div>
            </div>
            <div className="max-w-content mx-auto px-10 mt-4">
                <p className="text-xs text-text-muted text-center md:text-left">© 2025 lecture2code. All rights reserved.</p>
            </div>
        </footer>
    );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export default function Landing() {
    return (
        <div className="bg-bg-page min-h-screen font-body">
            <LandingNavbar />
            <HeroSection />
            <FeatureTabs />
            <BentoGrid />
            <TestimonialStrip />
            <StatsBar />
            <FinalCTA />
            <LandingFooter />
        </div>
    );
}
