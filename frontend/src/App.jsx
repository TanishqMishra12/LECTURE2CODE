import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import InputPage from "./pages/InputPage";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<InputPage />} />
        <Route path="/results/:jobId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
