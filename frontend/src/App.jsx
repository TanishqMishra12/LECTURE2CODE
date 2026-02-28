import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import InputPage from "./pages/InputPage";
import TheoryPage from "./pages/TheoryPage";
import NotebookPage from "./pages/NotebookPage";
import PdfResultPage from "./pages/PdfResultPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background-dark text-slate-300 font-mono">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/process" element={<InputPage />} />
              <Route path="/theory" element={<TheoryPage />} />
              <Route path="/notebook" element={<NotebookPage />} />
              <Route path="/pdf" element={<PdfResultPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
