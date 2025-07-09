import { Routes, Route, Navigate } from "react-router-dom";
import AddUrlPage from "./pages/AddUrlPage";
import DashboardPage from "./pages/DashboardPage";
import UrlDetailPage from "./pages/UrlDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AddUrlPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/url/:id" element={<UrlDetailPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
