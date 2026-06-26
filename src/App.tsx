import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "@/pages/landing";
import { AgentApply } from "@/pages/agent-apply";
import { AgentDashboard } from "@/pages/agent-dashboard";
import { AdminDashboard } from "@/pages/admin-dashboard";
import { Login } from "@/pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/apply" element={<AgentApply />} />
        <Route path="/login" element={<Login />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* old separate login paths now point at the single login */}
        <Route path="/agent/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
