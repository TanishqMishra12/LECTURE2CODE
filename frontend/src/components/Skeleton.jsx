export default function Skeleton() {
    return (
        <div className="animate-pulse-slow space-y-6 py-8" aria-busy="true" aria-label="Loading content">
            {/* Header lines */}
            <div className="space-y-3">
                <div className="h-7 w-1/3 rounded-lg bg-surface-600" />
                <div className="h-4 w-2/3 rounded bg-surface-700" />
                <div className="h-4 w-1/2 rounded bg-surface-700" />
            </div>

            {/* Content blocks */}
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 rounded-xl border border-surface-600 bg-surface-800 p-5">
                    <div className="h-5 w-1/4 rounded bg-surface-600" />
                    <div className="h-4 w-full rounded bg-surface-700" />
                    <div className="h-4 w-5/6 rounded bg-surface-700" />
                    <div className="h-4 w-4/6 rounded bg-surface-700" />
                    {/* Code block mock */}
                    <div className="mt-4 h-24 rounded-lg bg-surface-700" />
                </div>
            ))}
        </div>
    );
}
