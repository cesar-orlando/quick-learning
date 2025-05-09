import {
  Box,
  Button,
  Modal,
  Select,
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { Cliente } from "./types";
import FileDropzone from "../../components/FileDropzone"; // 👈 importa tu nuevo componente

interface Field {
  key: string;
  label: string;
  value: any;
  type?: string;
  options?: string[];
  visible?: boolean;
}

interface Props {
  open: boolean;
  cliente: Cliente | null;
  editingFields: Field[];
  setEditingFields: React.Dispatch<React.SetStateAction<Field[]>>;
  onClose: () => void;
  onSave: (updated: Cliente) => Promise<void>;
}

const ClienteEditModal = ({ open, cliente, editingFields, setEditingFields, onClose, onSave }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [localCliente, setLocalCliente] = useState<Cliente | null>(cliente);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalCliente(cliente);
  }, [cliente]);

  const handleChange = (key: string, value: any) => {
    const updated = editingFields.map((f) =>
      f.key === key ? { ...f, value } : f
    );
    setEditingFields(updated);
  };

  const handleSubmit = async () => {
    if (!localCliente) return;

    const updatedCliente: Cliente = {
      ...localCliente,
      customFields: editingFields.map((f) => ({
        key: f.key,
        label: f.label,
        value: f.value,
        visible: f.visible ?? true,
        type: f.type,
        options: f.options || [],
      })),
    };

    await onSave(updatedCliente);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            p: 4,
            bgcolor: "white",
            width: isMobile ? "90%" : 500,
            maxHeight: "90vh",
            overflowY: "auto",
            mx: "auto",
            mt: 8,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Editar Cliente
          </Typography>

          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={localCliente?.name || ""}
            onChange={(e) =>
              setLocalCliente((prev) => ({ ...prev!, name: e.target.value }))
            }
          />

          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            value={localCliente?.phone || ""}
            onChange={(e) =>
              setLocalCliente((prev) => ({ ...prev!, phone: e.target.value }))
            }
          />

          {editingFields.map((field) => {
            if (field.type === "select") {
              return (
                <Select
                  key={field.key}
                  fullWidth
                  value={field.value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  sx={{ mt: 2 }}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              );
            }

            if (field.type === "file") {
              return (
                <Box key={field.key} sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {field.label}
                  </Typography>
                  <FileDropzone
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={(urls) => handleChange(field.key, urls)}
                  />
                </Box>
              );
            }

            return (
              <TextField
                key={field.key}
                fullWidth
                label={field.label}
                value={field.value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                sx={{ mt: 2 }}
              />
            );
          })}

          <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
            Guardar Cambios
          </Button>
        </Box>
      </Modal>

      <Dialog open={!!previewFileUrl} onClose={() => setPreviewFileUrl(null)} fullWidth maxWidth="md">
        <DialogTitle>Archivo</DialogTitle>
        <DialogContent>
          {previewFileUrl?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
            <img src={previewFileUrl} alt="archivo" style={{ width: '100%' }} />
          ) : (
            <iframe src={previewFileUrl!} style={{ width: '100%', height: '80vh' }} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClienteEditModal;
