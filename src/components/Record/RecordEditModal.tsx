import {
  Box,
  Typography,
  Select,
  MenuItem,
  useMediaQuery,
  TextField,
  IconButton,
  Divider,
  Drawer,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import FileDropzone from "../FileDropzone";
import CloseIcon from "@mui/icons-material/Close";
import { NewButton } from "../ui/NewButton";
import api from "../../api/axios"; // Asegúrate de importar tu cliente API

interface Field {
  key: string;
  label: string;
  value: any;
  type?: string;
  options?: string[];
  visible?: boolean;
  format?: string;
}

interface Record {
  _id: string;
  tableSlug: string;
  customFields: Field[];
}

interface Props {
  open: boolean;
  record: Record | null;
  editingFields: Field[];
  setEditingFields: (fields: Field[]) => void;
  onClose: () => void;
  onSave: (updated: Record) => Promise<void>;
}

export const RecordEditModal = ({
  open,
  record,
  editingFields,
  setEditingFields,
  onClose,
  onSave,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [localRecord, setLocalRecord] = useState<Record | null>(record);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    setLocalRecord(record);
  }, [record]);

  // Obtener usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user"); // Ajusta la ruta según tu API
        setUsers(response.data.map((user: any) => ({ _id: user._id, name: user.name })));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (key: string, value: any) => {
    const updated = editingFields.map((f) => (f.key === key ? { ...f, value } : f));
    setEditingFields(updated);
  };

  const handleSubmit = async () => {
    if (!localRecord) return;

    const updatedRecord: Record = {
      ...localRecord,
      customFields: editingFields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options || [],
        visible: f.visible ?? true,
        value: f.value,
        format: f.format || "default",
      })),
    };

    await onSave(updatedRecord);
  };

  const formatAsCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts[1] ? `.${parts[1].slice(0, 2)}` : "";
    return `$${intPart}${decimalPart}`;
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Editar Registro</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {editingFields.map((field) => {
        if (field.key === "asesor") {
          const parsedValue = field.value ? JSON.parse(field.value) : null; // Parsear el valor si existe
          return (
            <Box key={field.key} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>{field.label}</Typography>
              <Select
                fullWidth
                value={parsedValue?._id || ""} // Mostrar el _id como valor seleccionado
                onChange={(e) => {
                  const selectedUser = users.find((user: any) => user._id === e.target.value);
                  if (selectedUser) {
                    handleChange(field.key, JSON.stringify({ name: selectedUser.name, _id: selectedUser._id }));
                  }
                }}
                size="small"
              >
                {users.map((user: any) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          );
        }

        if (field.type === "select") {
          return (
            <Box key={field.key} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>{field.label}</Typography>
              <Select
                fullWidth
                value={field.value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                size="small"
              >
                {field.options?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option === "true" ? "Activo" : option === "false" ? "Inactivo" : option}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          );
        }

        if (field.type === "file") {
          return (
            <Box key={field.key} sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{field.label}</Typography>
              <FileDropzone
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(urls) => handleChange(field.key, urls)}
              />
            </Box>
          );
        }

        return (
          <Box key={field.key} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>{field.label}</Typography>
            <TextField
              fullWidth
              size="small"
              value={field.format === "currency" ? formatAsCurrency(field.value?.toString() || "") : field.value}
              onChange={(e) => {
                const raw = field.format === "currency"
                  ? e.target.value.replace(/[^0-9.]/g, "")
                  : e.target.value;
                handleChange(field.key, raw);
              }}
            />
          </Box>
        );
      })}

      <NewButton label="Guardar Cambios" onClick={handleSubmit} />
    </Drawer>
  );
};

export default RecordEditModal;
