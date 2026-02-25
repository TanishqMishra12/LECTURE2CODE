import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [theory, setTheory] = useState("");
    const [notebook, setNotebook] = useState("");
    const [metadata, setMetadata] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const value = {
        theory, setTheory,
        notebook, setNotebook,
        metadata, setMetadata,
        sessionId, setSessionId,
        loading, setLoading,
        error, setError,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used inside AppProvider");
    return ctx;
}
