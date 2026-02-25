import { useEffect, useRef, useState } from "react";

function extractHeadings(markdown) {
    const lines = markdown.split("\n");
    const headings = [];
    for (const line of lines) {
        const match = line.match(/^(#{1,3})\s+(.+)/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-");
            headings.push({ level, text, id });
        }
    }
    return headings;
}

export default function TableOfContents({ markdown }) {
    const headings = extractHeadings(markdown);
    const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
    const observerRef = useRef(null);

    useEffect(() => {
        if (!headings.length) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: "-10% 0px -80% 0px", threshold: 0.1 }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observerRef.current.observe(el);
        });

        return () => observerRef.current?.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markdown]);

    if (!headings.length) return null;

    return (
        <nav
            aria-label="Table of contents"
            className="sticky top-20 hidden xl:block w-56 shrink-0 self-start"
        >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                On This Page
            </p>
            <ul className="space-y-1 border-l border-surface-600 pl-3">
                {headings.map(({ level, text, id }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={`block rounded py-0.5 text-sm transition-colors leading-snug
                ${level === 1 ? "font-semibold" : level === 2 ? "pl-2" : "pl-4 text-xs"}
                ${activeId === id
                                    ? "text-brand-400 border-l-2 border-brand-400 -ml-px pl-2"
                                    : "text-slate-500 hover:text-slate-200"
                                }`}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
