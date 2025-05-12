import { useEffect, useState, useMemo, useRef } from "react"; // Importar useRef
import { Box, Typography, Button, TextField} from "@mui/material";
import Lottie from "lottie-react";
import SearchIcon from "@mui/icons-material/Search";
import emptyAnimation from "../assets/empty.json";
import UsersTable from "../components/Users/UsersTable";
import api from "../api/axios";
import LoaderBackdrop from "../components/ui/LoaderBackdrop";
import NewUserModal from "../components/Users/NewUserModal";
import EditUserModal from "../components/Users/EditUserModal";

function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const fields = [
    { key: "name", label: "Nombre", type: "text", visible: true },
    { key: "email", label: "Correo Electrónico", type: "text", visible: true },
    { key: "role", label: "Rol", type: "text", visible: true },
  ];
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [openNewUser, setOpenNewUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // Estado para mostrar/ocultar el buscador
  const searchRef = useRef<HTMLInputElement>(null); // Referencia para el input del buscador

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user");
      setUsers(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchSearch = Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchSearch ;
    });

    if (sortField) {
      result = result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return result;
  }, [users, searchTerm, sortField, sortOrder]);

  if (loading) {
    return <LoaderBackdrop open={loading} text="Cargando usuarios..." />;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
          gap: 1,
        }}
      >
        {/* 🧾 Título de la tabla */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 2,
            gap: 1,
          }}
        >
          {/* 🧾 Título */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            Usuarios
          </Typography>

          {/* Botones: izquierda (+Nuevo + 🔍) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {/* + Nuevo */}
            <Button
              onClick={() => setOpenNewUser(true)}
              variant="contained"
              size="small"
              sx={{
                background: "linear-gradient(90deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)",
                color: "#fff",
                fontSize: "13px",
                borderRadius: "999px",
                padding: "4px 14px",
                textTransform: "none",
                minHeight: "30px",
                "&:hover": { opacity: 0.95 },
              }}
            >
              + Nuevo Registro
            </Button>

            {/* 🔍 Botón de búsqueda animada */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Button
                size="small"
                onClick={() => setShowSearch((prev) => !prev)}
                sx={{
                  minWidth: 0,
                  borderRadius: "999px",
                  padding: "6px",
                  color: "#3B82F6",
                }}
              >
                <SearchIcon />
              </Button>

              <Box
                sx={{
                  width: showSearch ? 200 : 0,
                  overflow: "hidden",
                  transition: "width 0.3s ease",
                  ml: 1,
                }}
              >
                <TextField
                  inputRef={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => setShowSearch(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowSearch(false);
                  }}
                  variant="standard"
                  placeholder="Buscar..."
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: "14px",
                      padding: "6px 1px",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Botones: derecha (Filtros + Configurar) */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }} />
          
      </Box>

      {/* Contenido principal */}
      {users.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 10,
            gap: 2,
          }}
        >
          <Box sx={{ width: 300 }}>
            <Lottie animationData={emptyAnimation} loop autoplay />
          </Box>
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            No hay usuarios aún.
          </Typography>
        </Box>
      ) : (
        <UsersTable
          users={filteredUsers}
          fields={fields}
          fetchUsers={fetchUsers}
          onEdit={(user) => {
            setEditingUser(user);
            setOpenEditUser(true);
          }}
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      )}

      {/* Modales */}
      <NewUserModal
        open={openNewUser}
        onClose={() => setOpenNewUser(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        open={openEditUser}
        onClose={() => setOpenEditUser(false)}
        user={editingUser}
        onSuccess={fetchUsers}
      />
    </Box>
  );
}

export default Users;