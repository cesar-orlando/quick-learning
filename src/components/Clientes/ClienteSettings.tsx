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
  import EditIcon from "@mui/icons-material/Edit";
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
    allFields: Field[];
    setAllFields: (fields: Field[]) => void;
    onSave: () => void;
    onDeleteField: (key: string, label: string) => void;
    onClose: () => void;
    onAddField: (field: Field) => Promise<void>;
    isLoading: boolean;
    fetchClientes: () => Promise<void>;
  }
  
  const ClienteSettings = ({
    open,
    allFields,
    setAllFields,
    onSave,
    onDeleteField,
    onClose,
    onAddField,
    isLoading,
    fetchClientes,
  }: Props) => {
    const [showAddFieldForm, setShowAddFieldForm] = useState(false);
    const [newField, setNewField] = useState<Field>({
      key: "",
      label: "",
      type: "text",
      options: [""],
      visible: true,
    });
    const [fieldErrors, setFieldErrors] = useState<{ key?: string }>({});
  
    const [showEditFieldModal, setShowEditFieldModal] = useState(false);
    const [editField, setEditField] = useState<Field | null>(null);
  
    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
  
      setNewField({ ...newField, key: value });
  
      let error = "";
      if (!value) {
        error = "El identificador no puede estar vacío.";
      } else if (!/^[a-z][a-z0-9_]*$/.test(value)) {
        error = "Debe iniciar con letra y solo usar letras, números o guiones bajos.";
      } else if (allFields.some((field) => field.key === value)) {
        error = "Este identificador ya existe.";
      }
  
      setFieldErrors((prev) => ({ ...prev, key: error }));
    };
  
    const toggleVisibility = (key: string) => {
      const updated = allFields.map((f) =>
        f.key === key ? { ...f, visible: !f.visible } : f
      );
      setAllFields(updated);
    };
  
    const handleAddField = async () => {
      if (fieldErrors.key) return;
  
      await onAddField({
        ...newField,
        options: newField.type === "select" ? newField.options?.filter((o) => o.trim()) : [],
      });
  
      setNewField({ key: "", label: "", type: "text", options: [""], visible: true });
      setShowAddFieldForm(false);
    };
  
    const modalStyle = {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 500,
      bgcolor: "background.paper",
      borderRadius: 2,
      p: 4,
      boxShadow: 24,
    };
  
    return (
      <>
        <Modal open={open} onClose={onClose}>
          <Box sx={{ p: 4, bgcolor: "white", width: 500, mx: "auto", mt: 8, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configurar campos visibles
            </Typography>
  
            {!showAddFieldForm ? (
              <>
                {allFields.map((field) => (
                  <Box
                    key={field.key}
                    sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={field.visible}
                        onChange={() => toggleVisibility(field.key)}
                      />
                      <Typography sx={{ ml: 1 }}>{field.label}</Typography>
                    </Box>
  
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditField(field);
                          setShowEditFieldModal(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
  
                      <IconButton
                        onClick={() => onDeleteField(field.key, field.label)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
  
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                  <Button variant="contained" onClick={onSave}>Guardar cambios</Button>
                  <Button variant="outlined" onClick={() => setShowAddFieldForm(true)}>+ Agregar nuevo campo</Button>
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
                  helperText={fieldErrors.key || "Debe ser único, minúsculo y sin espacios (ej. poder_adquisitivo)"}
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
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Opciones del select</Typography>
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
                  <Button variant="outlined" onClick={handleAddField} disabled={isLoading}>Guardar campo</Button>
                  <Button variant="text" color="secondary" onClick={() => setShowAddFieldForm(false)}>Cancelar</Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
  
        {editField && (
          <Modal open={showEditFieldModal} onClose={() => setShowEditFieldModal(false)}>
            <Box sx={modalStyle}>
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
              </FormControl>
  
              {editField.type === "select" && (
                <TextField
                  label="Opciones (separadas por coma)"
                  fullWidth
                  margin="normal"
                  value={editField.options?.join(",") || ""}
                  onChange={(e) =>
                    setEditField({
                      ...editField,
                      options: e.target.value.split(",").map((opt) => opt.trim()),
                    })
                  }
                />
              )}
  
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                onClick={async () => {
                  try {
                    await api.put(`/customers/update-custom-field/${editField.key}`, {
                      label: editField.label,
                      type: editField.type,
                      options: editField.options,
                    });
  
                    await fetchClientes();
                    setShowEditFieldModal(false);
                  } catch (error) {
                    alert("Error al actualizar el campo");
                  }
                }}
              >
                Guardar cambios
              </Button>
            </Box>
          </Modal>
        )}
      </>
    );
  };
  
  export default ClienteSettings;
  