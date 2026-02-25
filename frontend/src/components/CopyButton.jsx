import { useState } from "react";

export default function CopyButton({ text, label = "Copy", size = "sm" }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for older browsers
            const el = document.createElement("textarea");
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sizeClasses = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
    };

    return (
        <button
            onClick={handleCopy}
            title={copied ? "Copied!" : label}
            aria-label={copied ? "Copied to clipboard" : label}
            className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all
        ${sizeClasses[size] ?? sizeClasses.sm}
        ${copied
                    ? "bg-green-800/40 text-green-300 border border-green-600/40"
                    : "bg-surface-600 text-slate-300 border border-surface-500 hover:bg-surface-500 hover:text-white"
                }`}
        >
            {copied ? (
                <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="2 8 6 12 14 4" />
                    </svg>
                    Copied
                </>
            ) : (
                <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="4" width="9" height="9" rx="1.5" />
                        <path d="M3 11V3h8" />
                    </svg>
                    {label}
                </>
            )}
        </button>
    );
}
