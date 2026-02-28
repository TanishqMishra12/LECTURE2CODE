import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const navLinks = [
    { to: "/", label: "Process" },
    { to: "/theory", label: "Theory" },
    { to: "/notebook", label: "Notebook" },
    { to: "/pdf", label: "PDF Results" },
];

export default function Navbar() {
    const { pathname } = useLocation();
    const { sessionId, pdfSessionId } = useApp();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-surface-600 bg-surface-800/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-900/40 group-hover:shadow-brand-500/30 transition-shadow">
                        L2C
                    </div>
                    <span className="font-semibold text-white tracking-tight">Lecture2Code</span>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-1">
                    {navLinks.map(({ to, label }) => {
                        const active = pathname === to;
                        if ((to === "/theory" || to === "/notebook") && !sessionId) return null;
                        if (to === "/pdf" && !pdfSessionId) return null;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active
                                    ? "bg-brand-600 text-white shadow shadow-brand-900/30"
                                    : "text-slate-400 hover:bg-surface-600 hover:text-white"
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

