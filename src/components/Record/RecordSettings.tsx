import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { NewButton } from "../ui/NewButton";

interface Field {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  visible: boolean;
  format: string;
}

interface Props {
  open: boolean;
  slug: string;
  fields: Field[];
  setFields: (fields: Field[]) => void;
  fetchFields: () => Promise<void>;
  onClose: () => void;
}

const RecordSettings = ({ open, slug, fields, setFields, fetchFields, onClose }: Props) => {
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newField, setNewField] = useState<Field>({
    key: "",
    label: "",
    type: "text",
    options: [""],
    visible: true,
    format: "default",
  });
  const [fieldErrors, setFieldErrors] = useState<{ key?: string }>({});
  const [editField, setEditField] = useState<Field | null>(null);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setNewField({ ...newField, key: value });

    let error = "";
    if (!value) error = "El identificador no puede estar vacío.";
    else if (!/^[a-z][a-z0-9_]*$/.test(value))
      error = "Debe iniciar con letra y solo usar letras, números o guiones bajos.";
    else if (fields.some((field) => field.key === value)) error = "Este identificador ya existe.";

    setFieldErrors((prev) => ({ ...prev, key: error }));
  };

  const toggleVisibility = (key: string) => {
    const updated = fields.map((f) => (f.key === key ? { ...f, visible: !f.visible } : f));
    setFields(updated);
  };

  const handleAddField = async () => {
    if (fieldErrors.key) return;
    try {
      await api.post(`/records/add-custom-field/${slug}`, {
        key: newField.key,
        label: newField.label,
        type: newField.type,
        options: newField.type === "select" ? newField.options?.filter((o) => o.trim()) : [],
        format: newField.type === "number" ? newField.format || "default" : undefined,
      });
      setShowAddFieldForm(false);
      setNewField({ key: "", label: "", type: "text", options: [""], visible: true, format: "default" });
      fetchFields();
    } catch (error) {
      alert("Error al agregar campo");
    }
  };

  const showPrettyErrorModal = (message: string) => {
    Swal.fire({
      icon: "warning",
      title: "Acción no permitida",
      text: message,
      confirmButtonColor: "#6366f1",
      confirmButtonText: "Entendido",
    });
  };

  const handleDeleteField = async (key: string, label: string) => {
    const confirmDelete = window.confirm(`¿Seguro que quieres eliminar el campo "${label}"?`);
    if (!confirmDelete) return;
    try {
      await api.delete(`/records/delete-custom-field/${slug}/${key}`);
      fetchFields();
    } catch (error: any) {
      if (error.response?.status === 400) {
        showPrettyErrorModal(error.response.data.message || "Error desconocido.");
      } else {
        showPrettyErrorModal("Ocurrió un error al intentar eliminar el campo.");
      }
    }
  };

  const handleUpdateField = async () => {
    if (!editField) return;
    try {
      await api.put(`/records/update-custom-field/${slug}/${editField.key}`, {
        label: editField.label,
        type: editField.type,
        options: editField.options,
        format: editField.format || "default",
      });
      setEditField(null);
      fetchFields();
    } catch (error) {
      alert("Error al actualizar campo");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          maxWidth: "100%",
          padding: 3,
          borderLeft: "2px solid #E5E7EB",
          boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Configurar campos
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {!showAddFieldForm ? (
        <>
          {fields.map((field) => (
            <Box key={field.key} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center">
                <input type="checkbox" checked={field.visible} onChange={() => toggleVisibility(field.key)} />
                <Typography sx={{ ml: 1 }}>{field.label}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small" onClick={() => setEditField(field)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteField(field.key, field.label)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Box display="flex" justifyContent="space-between" mt={2}>
            <NewButton label="+ Agregar nuevo campo" onClick={() => setShowAddFieldForm(true)} />
            <NewButton label="Cerrar" onClick={onClose} />
          </Box>
        </>
      ) : (
        <>
          <TextField
            label="Identificador (key)"
            fullWidth
            margin="normal"
            value={newField.key}
            onChange={handleKeyChange}
            error={!!fieldErrors.key}
            helperText={fieldErrors.key || "Debe ser único, minúsculo y sin espacios"}
          />
          <TextField
            label="Nombre visible (label)"
            fullWidth
            margin="normal"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newField.type}
              label="Tipo"
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            >
              <MenuItem value="text">Texto</MenuItem>
              <MenuItem value="number">Número</MenuItem>
              <MenuItem value="select">Select</MenuItem>
              <MenuItem value="file">Archivo</MenuItem>
            </Select>
            {newField.type === "number" && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Formato</InputLabel>
                <Select
                  value={newField.format}
                  label="Formato"
                  onChange={(e) => setNewField({ ...newField, format: e.target.value })}
                >
                  <MenuItem value="default">Número</MenuItem>
                  <MenuItem value="currency">Moneda (MXN)</MenuItem>
                </Select>
              </FormControl>
            )}
          </FormControl>

          {newField.type === "select" && (
            <>
              <Typography variant="subtitle2" mt={1}>
                Opciones del select
              </Typography>
              {newField.options?.map((opt, i) => (
                <TextField
                  key={i}
                  value={opt}
                  margin="dense"
                  onChange={(e) => {
                    const updated = [...(newField.options || [])];
                    updated[i] = e.target.value;
                    setNewField({ ...newField, options: updated });
                  }}
                />
              ))}

              <Button
                onClick={() => setNewField({ ...newField, options: [...(newField.options || []), ""] })}
                size="small"
                sx={{ mt: 1 }}
              >
                + Agregar opción
              </Button>
            </>
          )}

          <Box mt={3} display="flex" justifyContent="space-between">
            <NewButton label="Guardar campo" onClick={handleAddField} />
            <Button variant="text" color="secondary" onClick={() => setShowAddFieldForm(false)}>
              Cancelar
            </Button>
          </Box>
        </>
      )}

      {editField && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Editar Campo</Typography>
          <TextField
            label="Etiqueta"
            fullWidth
            margin="normal"
            value={editField.label}
            onChange={(e) => setEditField({ ...editField, label: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={editField.type}
              onChange={(e) => setEditField({ ...editField, type: e.target.value })}
              label="Tipo"
            >
              <MenuItem value="text">Texto</MenuItem>
              <MenuItem value="number">Número</MenuItem>
              <MenuItem value="select">Select</MenuItem>
              <MenuItem value="file">Archivo</MenuItem>
            </Select>
            {editField.type === "number" && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Formato</InputLabel>
                <Select
                  value={editField.format || "default"}
                  label="Formato"
                  onChange={(e) => setEditField({ ...editField, format: e.target.value })}
                >
                  <MenuItem value="default">Número</MenuItem>
                  <MenuItem value="currency">Moneda (MXN)</MenuItem>
                </Select>
              </FormControl>
            )}
          </FormControl>
          {editField.type === "select" && (
            <TextField
              label="Opciones (separadas por coma)"
              fullWidth
              margin="normal"
              value={editField.options?.join(",") || ""}
              onChange={(e) =>
                setEditField({ ...editField, options: e.target.value.split(",").map((opt) => opt.trim()) })
              }
            />
          )}
          <NewButton label="Guardar cambios" onClick={handleUpdateField} />
        </Box>
      )}
    </Drawer>
  );
};

export default RecordSettings;
