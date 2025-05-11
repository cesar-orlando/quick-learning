import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Layout from "./components/Layout";
import TablePage from "./pages/TablePage";
import AIPage from "./pages/AI";
import Users from "./pages/Users";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
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
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/ia" element={<AIPage />} />
        <Route path="/:slug" element={<TablePage />} />
        <Route path="/usuarios" element={<Users />} />
      </Route>

      {/* Catch-all redirige a login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
