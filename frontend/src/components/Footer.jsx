export default function Footer() {
    return (
        <footer className="bg-background-dark border-t border-slate-800 py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-primary">
                            <span className="material-symbols-outlined text-2xl">terminal</span>
                        </div>
                        <h2 className="text-white text-lg font-black tracking-tighter">LECTURE2CODE</h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        © 2024 LECTURE2CODE. ALL SYSTEMS OPERATIONAL.
                    </p>
                </div>
                <div className="flex flex-wrap gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <a className="hover:text-primary transition-colors" href="#">[ Privacy Policy ]</a>
                    <a className="hover:text-primary transition-colors" href="#">[ Terms of Service ]</a>
                    <a className="hover:text-primary transition-colors" href="#">[ Contact ]</a>
                </div>
            </div>
        </footer>
    );
}
