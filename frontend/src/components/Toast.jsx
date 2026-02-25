import { useEffect, useState } from "react";

export default function Toast({ message, type = "error", onDismiss }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
        }, 5000);
        return () => clearTimeout(t);
    }, [onDismiss]);

    const colors = {
        error: "border-red-500/30 bg-red-950/60 text-red-300",
        warning: "border-yellow-500/30 bg-yellow-950/60 text-yellow-300",
        info: "border-brand-500/30 bg-brand-950/60 text-brand-300",
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-sm transition-all duration-300
        ${colors[type] ?? colors.error}
        ${visible ? "animate-slide-up opacity-100" : "translate-y-2 opacity-0"}`}
        >
            <span className="mt-0.5 shrink-0 text-lg">
                {type === "error" ? "!" : type === "warning" ? "⚠" : "i"}
            </span>
            <p className="text-sm leading-relaxed">{message}</p>
            <button
                onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
                className="ml-auto shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
            >
                x
            </button>
        </div>
    );
}

/**
 * Container rendered at bottom-right of screen.
 * Usage: <ToastContainer toasts={[{ id, message, type }]} onRemove={fn} />
 */
export function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3" aria-live="polite">
            {toasts.map((t) => (
                <Toast
                    key={t.id}
                    message={t.message}
                    type={t.type}
                    onDismiss={() => onRemove(t.id)}
                />
            ))}
        </div>
    );
}

/** Hook to manage toast list */
export function useToasts() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "error") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return { toasts, addToast, removeToast };
}
