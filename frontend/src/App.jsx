import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import InputPage from "./pages/InputPage";
import TheoryPage from "./pages/TheoryPage";
import NotebookPage from "./pages/NotebookPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<InputPage />} />
              <Route path="/theory" element={<TheoryPage />} />
              <Route path="/notebook" element={<NotebookPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
