import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navbar() {
    const { pathname } = useLocation();
    const { sessionId, pdfSessionId } = useApp();

    const isLanding = pathname === "/";

    return (
        <header className="flex items-center justify-between border-b border-slate-800 px-6 md:px-12 py-4 bg-background-dark/90 backdrop-blur-md sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="text-primary">
                    <span className="material-symbols-outlined text-2xl">terminal</span>
                </div>
                <h2 className="text-white text-lg font-bold tracking-tight uppercase">LECTURE2CODE.SYS</h2>
            </Link>

            <div className="hidden md:flex flex-1 justify-end gap-10 items-center">
                <nav className="flex items-center gap-6">
                    {isLanding ? (
                        <>
                            <a className="text-slate-500 text-xs font-bold hover:text-primary transition-colors" href="#features">
                                [ 01. FEATURES ]
                            </a>
                            <a className="text-slate-500 text-xs font-bold hover:text-primary transition-colors" href="#preview">
                                [ 02. PREVIEW ]
                            </a>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                className={`text-xs font-bold transition-colors ${pathname === "/" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
                            >
                                [ HOME ]
                            </Link>
                            {sessionId && (
                                <>
                                    <Link
                                        to="/theory"
                                        className={`text-xs font-bold transition-colors ${pathname === "/theory" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
                                    >
                                        [ THEORY ]
                                    </Link>
                                    <Link
                                        to="/notebook"
                                        className={`text-xs font-bold transition-colors ${pathname === "/notebook" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
                                    >
                                        [ NOTEBOOK ]
                                    </Link>
                                </>
                            )}
                            {pdfSessionId && (
                                <Link
                                    to="/pdf"
                                    className={`text-xs font-bold transition-colors ${pathname === "/pdf" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
                                >
                                    [ PDF RESULTS ]
                                </Link>
                            )}
                        </>
                    )}
                </nav>

                {isLanding && (
                    <a
                        href="#hero"
                        className="bg-primary hover:brightness-110 text-white px-6 py-2 text-xs font-bold transition-all flex items-center gap-2"
                    >
                        RUN GET_STARTED.SH
                    </a>
                )}
            </div>
        </header>
    );
}
