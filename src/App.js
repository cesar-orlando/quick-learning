import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import axios from "axios";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Logout from "@mui/icons-material/Logout";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import routesUser from "routesUser";
import { useMaterialUIController } from "context";
import withAuth from "./middleware/withJWT"; // 🔹 Middleware para proteger rutas
import SignIn from "layouts/authentication/sign-in"; // Importar login para redirigir si no hay sesión
import qlLogo from "assets/images/ql.jpeg"; // Importar la imagen

function App() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { pathname } = useLocation();

  const isAuthenticated = sessionStorage.getItem("token"); // 🔹 Verifica si hay usuario autenticado
  const isLargeScreen = window.innerWidth > 960;
  const [open, setOpen] = useState(isLargeScreen);
  const [hover, setHover] = useState(false);
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(false);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem("user");
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/${userId}`);
        const userData = userResponse.data.user;
        setUser(userData);
        setUserStatus(userData.status == "1" ? true : false); // Actualiza el estado del Switch basado en el estado del usuario
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, userStatus]);


  const handleStatusChange = async (event) => {
    const newStatus = event.target.checked ? "1" : "2";
    try {
      const userId = sessionStorage.getItem("user");
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/user/update/${userId}`, { status: newStatus });
      setUserStatus(event.target.checked); // Actualiza el estado del Switch
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally{
      window.location.reload(); // Recargar la página para actualizar el estado del usuario
    }
  };

  const permissions = sessionStorage.getItem("permissions");
  const routesResult = permissions === "3" ? routesUser : routes;

  // 🔹 **Ocultar menú en la pantalla de login**
  if (pathname === "/authentication/sign-in") {
    return (
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        <Routes>
          <Route path="/authentication/sign-in" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <div style={{ display: "flex" }}>
        {/* 🔹 Menú lateral (se oculta si el usuario no está autenticado) */}
        {isAuthenticated && (
          <Drawer
            variant="permanent"
            open={open}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{
              width: hover ? 240 : 60,
              transition: "width 0.3s",
              "& .MuiDrawer-paper": {
                width: hover ? 240 : 60,
                transition: "width 0.3s",
                overflow: "hidden",
                display: "flex",
                alignItems: "center", // Centrar el contenido horizontalmente
              },
            }}
          >
            <List sx={{ width: "100%" }}>
              {user && (
                <>
                  <ListItem disablePadding sx={{ justifyContent: "center" }}>
                    <ListItemButton sx={{ justifyContent: "center" }}>
                      <ListItemIcon sx={{ justifyContent: "center" }}>
                        <Avatar src={qlLogo} sx={{ width: 44, height: 44 }} />
                      </ListItemIcon>
                      {hover && <ListItemText primary="Quick Learning" />}
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ justifyContent: "center" }}>
                    <ListItemButton sx={{ justifyContent: "center" }}>
                      <ListItemIcon sx={{ justifyContent: "center" }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 15 }}>{user.name.charAt(0)}</Avatar>
                      </ListItemIcon>
                      {hover && (
                        <>
                          <ListItemText primary={user.name} />
                          <Switch checked={userStatus} onChange={handleStatusChange} />
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                </>
              )}
              {routesResult.map((route) => (
                route.type === "collapse" && (
                  <ListItem key={route.key} disablePadding sx={{ justifyContent: "center" }}>
                    <ListItemButton component={Link} to={route.route} sx={{ justifyContent: "center" }}>
                      <ListItemIcon sx={{ justifyContent: "center" }}>{route.icon}</ListItemIcon>
                      {hover && <ListItemText primary={route.name} />}
                    </ListItemButton>
                  </ListItem>
                )
              ))}
            </List>
            <Divider />
            <List sx={{ width: "100%" }}>
              <ListItem disablePadding sx={{ justifyContent: "center" }}>
                <ListItemButton onClick={() => sessionStorage.clear()} sx={{ justifyContent: "center" }}>
                  <ListItemIcon sx={{ justifyContent: "center" }}>{<Logout />}</ListItemIcon>
                  {hover && <ListItemText primary="Cerrar Sesión" />}
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
        )}

        {/* 🔹 Contenido Principal */}
        <div
          style={{
            flexGrow: 1,
            marginLeft: isAuthenticated ? (hover ? "20px" : "0px") : "0px",
            transition: "margin 0.3s ease-in-out",
            padding: 2,
          }}
        >

          <Routes>
            {routesResult.map((route) => (
              route.route && <Route key={route.key} path={route.route} element={route.component} />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
