import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Layout from "./components/Layout"; // 👈 asegúrate de importar bien
import TablePage from "./pages/TablePage";
import AIPage from "./pages/AI";
import Users from "./pages/Users";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas envueltas con Layout */}
        <Route element={<Layout />}>
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ia" element={<AIPage />} />
          <Route path="/:slug" element={<TablePage />} /> {/* 🔥 ruta dinámica */}
          <Route path="/usuarios" element={<Users />} /> {/* Ruta de usuarios fija */}
        </Route>

        {/* Catch-all redirige a login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
