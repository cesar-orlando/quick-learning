import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import { useTheme, useMediaQuery } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; // Importa Axios configurado

const drawerWidth = 240;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout } = useAuth();
  const menuOpen = Boolean(anchorEl);
  const inactivityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado local para manejar el estado del usuario
  const [isActive, setIsActive] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.status === "active";
  });

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const setUserStatus = async (status: boolean) => {
    try {
      if(status) return;

      if (user && user.id) {
        const response = await api.put(`/user/${user.id}`, { status });


        if (response.status === 200) {
          const updatedUser = { ...user, status: status};
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setIsActive(status); // Actualiza el estado local
        } else {
          console.error("Error en la respuesta del servidor:", response);
        }
      }
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
    }
  };

  const resetInactivityTimer = () => {

    // Cambiar a activo si el usuario estaba inactivo
    if (!isActive) {
      setUserStatus(true); // Cambia el estado a activo
    }

    // Reinicia el temporizador de inactividad
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }

    inactivityTimeout.current = setTimeout(() => {
      setUserStatus(false); // Cambia el estado a inactivo
    }, 15 * 60 * 1000); // 15 minutos
  };

  useEffect(() => {

    // Detectar eventos de actividad del usuario
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);

    // Configurar el temporizador inicial
    resetInactivityTimer();

    return () => {

      // Limpiar eventos y temporizador al desmontar el componente
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);

      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current);
      }
    };
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar con botón hamburguesa solo en móvil */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: 1201,
          backgroundColor: "#fff",
          color: "#333",
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Menú hamburguesa solo en móvil */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: "#7B61FF",
              }}
            >
              Quick Learning Admin
            </Typography>
          </Box>

          {/* Perfil */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
            }}
            onClick={handleProfileClick}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: isActive ? "#4CAF50" : "#BDBDBD",
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#333" }}>
              {user?.name || "Usuario"}
            </Typography>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#7B61FF",
                fontSize: 14,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
                minWidth: 220,
              },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={async (e) => {
                    const newStatus = e.target.checked ? "active" : "inactive";

                    try {
                      // Llamada al endpoint usando Axios
                      const response = await api.put(`/user/${user.id}`, {
                        status: newStatus === "active",
                      });

                      if (response.status === 200) {
                        const updated = { ...user, status: newStatus };
                        localStorage.setItem("user", JSON.stringify(updated));
                        setIsActive(newStatus === "active"); // Actualiza el estado local
                      }
                    } catch (error) {
                      console.error("Error al actualizar estado:", error);
                    }
                  }}
                />
              }
              label={isActive ? "Activo" : "Inactivo"}
              sx={{ mt: 1 }}
            />
            <MenuItem
              onClick={() => {
                logout();
                handleClose();
              }}
              sx={{
                mt: 1,
                justifyContent: "center",
                color: "#f44336", // rojo para enfatizar acción destructiva
                fontWeight: 500,
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar responsive */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
