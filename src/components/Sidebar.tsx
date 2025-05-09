import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Menu,
  MenuItem,
  Typography,
  Fade,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import { useTables } from "../hooks/useTables"; // 🚀
import { NewButton } from "../components/ui/NewButton"; // Nuevo botón reutilizable
import { NewTableModal } from "../components/Table/NewTableModal"; // Modal que creaste
import { useState } from "react"; // Para controlar abrir/cerrar modal
import { EditTableModal } from "./Table/EditTableModal";
import api from "../api/axios";
import { colors } from "../theme/colors";

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { tables, refetch } = useTables();

  const [openNewTable, setOpenNewTable] = useState(false); // Estado para abrir/cerrar modal
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleEditTable = (table: any) => {
    console.log("Editar tabla:", table);
    setOpenEditModal(true);
  };

  const handleDeleteTable = (table: any) => {
    setEditingTable(table);
    setOpenDeleteModal(true);
  };

  const confirmDeleteTable = async () => {
    if (!editingTable) return;

    try {
      await api.delete(`/tables/delete/${editingTable._id}`);
      setOpenDeleteModal(false);
      setEditingTable(null);
      refetch(); // 🔥 Para recargar las tablas visibles
    } catch (error) {
      console.error("Error al eliminar tabla:", error);
    }
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", padding: 2 }}>
        {/* 🔥 Botón para nueva tabla */}
        <NewButton label="Nueva Tabla" onClick={() => setOpenNewTable(true)} />
        <List>
          {/* IA */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/ia");
                if (isMobile) onClose();
              }}
            >
              <ListItemIcon>
                <Box
                  component="span"
                  sx={{
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                  }}
                >
                  🤖
                </Box>
              </ListItemIcon>
              <ListItemText primary="IA" />
            </ListItemButton>
          </ListItem>

          {/* Tablas dinámicas */}
          {tables.map((table) => (
            <ListItem key={table._id} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(`/${table.slug}`);
                  if (isMobile) onClose();
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Parte izquierda: Icono + Nombre */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                    }}
                  >
                    {table.icon || <PeopleIcon />}
                  </Box>
                  <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>{table.name}</Typography>
                </Box>

                {/* Parte derecha: Botón "..." */}
                <Box
                  component="span"
                  sx={{
                    fontSize: "20px",
                    cursor: "pointer",
                    opacity: 0.6,
                    transition: "opacity 0.2s",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar que haga navigate
                    setAnchorEl(e.currentTarget);
                    setEditingTable(table);
                  }}
                >
                  ⋯
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
          {/* Usuarios */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/usuarios");
                if (isMobile) onClose();
              }}
            >
              <ListItemIcon>
                <Box
                  component="span"
                  sx={{
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                  }}
                >
                  👤
                </Box>
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
            </ListItemButton>
          </ListItem>
        </List>
        {/* 🔥 Modal de nueva tabla */}
        <NewTableModal open={openNewTable} onClose={() => setOpenNewTable(false)} onSuccess={refetch} />
        {/* 🔥 Modal de edición */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          TransitionComponent={Fade} // 🔥 Animación al abrir
          PaperProps={{
            sx: {
              borderRadius: "10px",
              minWidth: 200,
              bgcolor: "#2C2C2C", // 🔥 Fondo oscuro
              color: "#fff",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
              overflow: "hidden",
              mt: 1,
              "& .MuiMenuItem-root": {
                fontSize: "14px",
                gap: 1,
                paddingY: 1,
                "&:hover": {
                  bgcolor: "#4B4B4B",
                },
              },
            },
          }}
        >
          {/* Opción Editar */}
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              handleEditTable(editingTable);
            }}
          >
            <Typography sx={{ fontSize: "18px" }}>✏️</Typography>
            <Typography>Editar</Typography>
          </MenuItem>

          {/* Divider bonito */}
          <Divider sx={{ bgcolor: "#555" }} />

          {/* Opción Eliminar */}
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              handleDeleteTable(editingTable);
            }}
            sx={{
              color: "#f44336", // Texto rojo para eliminar
              "&:hover": {
                bgcolor: "#661111",
              },
            }}
          >
            <Typography sx={{ fontSize: "18px" }}>🗑️</Typography>
            <Typography>Eliminar</Typography>
          </MenuItem>
        </Menu>
        <EditTableModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          table={editingTable}
          onSuccess={refetch}
        />
        {/* 🔥 Modal de confirmación de eliminación */}
        <Dialog
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          TransitionComponent={Fade} // 🔥 Aquí agregamos la animación
          PaperProps={{
            sx: {
              borderRadius: "20px",
              padding: 2,
              backgroundColor: "#fff",
              minWidth: { xs: "90%", sm: "400px" },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>¿Eliminar Tabla?</DialogTitle>

          <DialogContent sx={{ textAlign: "center", fontSize: "16px" }}>
            ¿Seguro que quieres eliminar <b>{editingTable?.name}</b>?
            <br />
            Esta acción no se puede deshacer.
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", gap: 2, marginBottom: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDeleteModal(false)}
              sx={{
                borderColor: colors.purple,
                color: colors.purple,
                "&:hover": {
                  backgroundColor: colors.purple,
                  color: "#fff",
                },
              }}
            >
              Cancelar
            </Button>

            <Button variant="contained" color="error" onClick={confirmDeleteTable}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  );
}
