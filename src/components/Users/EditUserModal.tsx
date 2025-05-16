import { Box, Drawer, IconButton, Typography, TextField, Button, CircularProgress, Backdrop } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export const EditUserModal = ({ open, onClose, user, onSuccess }: Props) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "viewer",
      status: user?.status || "true",
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) reset(user);
  }, [open, user]);

  const onSubmitEdit = async (data: any) => {
    try {
      setLoading(true);
      await api.put(`/user/${user._id}`, data);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Error al editar usuario:", err);
      alert("Error al editar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const newPassword = prompt("Ingrese la nueva contraseña para el usuario:");
      if (!newPassword) {
        alert("La contraseña no puede estar vacía.");
        return;
      }

      await api.put(`/user/${user._id}`, { password: newPassword });
      alert("Contraseña restablecida correctamente.");
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      alert("Error al restablecer contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          padding: 3,
          marginTop: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
          overflowY: "auto",
          backgroundColor: "#fff",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitEdit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Editar Usuario
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Controller
          name="name"
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label="Nombre" />}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label="Correo Electrónico" />}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) =>( <TextField {...field} select fullWidth label="Rol" SelectProps={{ native: true }}>
            <option value="admin">Administrador</option>
            <option value="editor">Editor</option>
            <option value="viewer">Espectador</option>
          </TextField>
            )}
          />
        
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <TextField {...field} select fullWidth label="Activo" SelectProps={{ native: true }}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </TextField>
          )}
        />

        <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
          Guardar Cambios
        </Button>

        <Button variant="outlined" color="secondary" onClick={handleResetPassword} fullWidth disabled={loading}>
          Restablecer Contraseña
        </Button>
      </Box>

      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Drawer>
  );
};

export default EditUserModal;
