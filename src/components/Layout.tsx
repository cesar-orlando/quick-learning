import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
    AppBar,
    Box,
    CssBaseline,
    IconButton,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import { useTheme, useMediaQuery } from "@mui/material";


const drawerWidth = 240;

export default function Layout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* AppBar con botón hamburguesa solo en móvil */}
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Quick Learning
                    </Typography>
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
