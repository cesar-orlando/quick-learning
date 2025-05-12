import {
  Box,
  Drawer,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  CircularProgress,
  Backdrop,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { NewButton } from "../ui/NewButton";
import api from "../../api/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = yup.object().shape({
  name: yup.string().required("El nombre es obligatorio"),
  email: yup.string().email("Correo inválido").required("El correo es obligatorio"),
  password: yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es obligatoria"),
  role: yup.string().oneOf(["admin", "sales", "viewer"], "Rol inválido").required("El rol es obligatorio"),
});

export const NewUserModal = ({ open, onClose, onSuccess }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<yup.InferType<typeof schema>>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "viewer",
    },
  });

  useEffect(() => {
    if (open) reset();
  }, [open]);

  const onSubmitCreate = async (data: any) => {
    try {
      await api.post("/user", data);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("❌ Error al crear usuario:", err);
      alert("Error al crear usuario");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 500,
          padding: 3,
          marginTop: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
          overflowY: "auto",
          backgroundColor: "#fff",
          borderLeft: "2px solid #E5E7EB",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitCreate)}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Nuevo Usuario
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Nombre"
              error={!!errors.name}
              helperText={String(errors.name?.message || "")}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Correo Electrónico"
              error={!!errors.email}
              helperText={String(errors.email?.message || "")}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Contraseña"
              type="password"
              error={!!errors.password}
              helperText={String(errors.password?.message || "")}
            />
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Rol</InputLabel>
              <Select {...field} label="Rol">
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="sales">Asesor</MenuItem>
                <MenuItem value="viewer">Visualizar</MenuItem>
              </Select>
              <FormHelperText>{String(errors.role?.message || "")}</FormHelperText>
            </FormControl>
          )}
        />

        <NewButton onClick={handleSubmit(onSubmitCreate)} label="Guardar" fullWidth />
      </Box>

      <Backdrop open={false} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Drawer>
  );
};

export default NewUserModal;