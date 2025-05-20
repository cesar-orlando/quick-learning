import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import TablePage from "./pages/TablePage";
import AIPage from "./pages/AI";
import Users from "./pages/Users";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  return (
    <Routes>
      {/* Página pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {isAdmin ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ia" element={<AIPage />} />
            <Route path="/:slug" element={<TablePage />} />
            <Route path="/usuarios" element={<Users />} />
          </>
        ) : (
          <Route path="/:slug" element={<TablePage />} />
        )}
      </Route>

      {/* Catch-all redirige a login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
