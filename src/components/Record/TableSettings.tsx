import {
    Box,
    Button,
    IconButton,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    TextField,
    Typography,
    FormControl,
  } from "@mui/material";
  import DeleteIcon from "@mui/icons-material/Delete";
  import { useState } from "react";
  import api from "../../api/axios";
  
  interface Field {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    visible: boolean;
  }
  
  interface Props {
    open: boolean;
    slug: string;
    fields: Field[];
    setFields: (fields: Field[]) => void;
    onClose: () => void;
    fetchFields: () => Promise<void>;
  }
  
  export const TableSettings = ({ open, slug, fields, onClose, fetchFields }: Props) => {
    const [showAddFieldForm, setShowAddFieldForm] = useState(false);
    const [newField, setNewField] = useState<Field>({
      key: "",
      label: "",
      type: "text",
      options: [""],
      visible: true,
    });
    const [fieldErrors, setFieldErrors] = useState<{ key?: string }>({});
  
    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
  
      setNewField({ ...newField, key: value });
  
      let error = "";
      if (!value) {
        error = "El identificador no puede estar vacío.";
      } else if (!/^[a-z][a-z0-9_]*$/.test(value)) {
        error = "Debe iniciar con letra y solo usar letras, números o guiones bajos.";
      } else if (fields.some((field) => field.key === value)) {
        error = "Este identificador ya existe.";
      }
  
      setFieldErrors((prev) => ({ ...prev, key: error }));
    };
  
    const handleAddField = async () => {
      if (fieldErrors.key) return;
  
      try {
        await api.post(`/tables/add-custom-field/${slug}`, {
          key: newField.key,
          label: newField.label,
          type: newField.type,
          options: newField.type === "select" ? newField.options?.filter((o) => o.trim()) : [],
          visible: true,
        });
  
        await fetchFields();
        setNewField({ key: "", label: "", type: "text", options: [""], visible: true });
        setShowAddFieldForm(false);
      } catch (error) {
        console.error("Error agregando campo:", error);
      }
    };
  
    const handleDeleteField = async (key: string) => {
      if (!confirm("¿Seguro que quieres eliminar este campo?")) return;
  
      try {
        await api.delete(`/tables/delete-custom-field/${slug}/${key}`);
        await fetchFields();
      } catch (error) {
        console.error("Error eliminando campo:", error);
      }
    };
  
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={{ p: 4, bgcolor: "white", width: 500, mx: "auto", mt: 8, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Configurar Campos
          </Typography>
  
          {!showAddFieldForm ? (
            <>
              {fields.map((field) => (
                <Box key={field.key} sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}>
                  <Typography>{field.label}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleDeleteField(field.key)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
  
              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                <Button variant="contained" onClick={() => setShowAddFieldForm(true)}>
                  + Agregar nuevo campo
                </Button>
                <Button variant="outlined" onClick={onClose}>Cerrar</Button>
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
                helperText={fieldErrors.key || "Ej: nombre, telefono, presupuesto..."}
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
              </FormControl>
  
              {newField.type === "select" && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Opciones para Select</Typography>
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
                    onClick={() =>
                      setNewField({ ...newField, options: [...(newField.options || []), ""] })
                    }
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    + Agregar opción
                  </Button>
                </>
              )}
  
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button variant="outlined" onClick={handleAddField}>Guardar campo</Button>
                <Button variant="text" onClick={() => setShowAddFieldForm(false)}>Cancelar</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    );
  };
  