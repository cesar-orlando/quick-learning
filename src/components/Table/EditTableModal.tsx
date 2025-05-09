import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Box,
  } from "@mui/material";
  import { SaveButton } from "../ui/SaveButton.tsx";
  import { NewButton } from "../ui/NewButton.tsx"; // Para cancelar
  import { useState, useEffect } from "react";
  import api from "../../api/axios.ts";
  import { colors } from "../../theme/colors.tsx";
  
  interface EditTableModalProps {
    open: boolean;
    onClose: () => void;
    table: any; // 👈 Tipo rápido (luego puedes tiparlo bien)
    onSuccess: () => void;
  }
  
  export const EditTableModal = ({ open, onClose, table, onSuccess }: EditTableModalProps) => {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [icon, setIcon] = useState("");
  
    useEffect(() => {
      if (table) {
        setName(table.name);
        setSlug(table.slug);
        setIcon(table.icon || "");
      }
    }, [table]);
  
    const handleSave = async () => {
      if (!name || !slug || !icon) return;
  
      try {
        await api.put(`/tables/update/${table._id}`, {
          name,
          slug,
          icon,
        });
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error updating table", error);
      }
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            padding: 3,
            backgroundColor: "#fff",
            minWidth: { xs: "90%", sm: "450px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: colors.black,
            fontSize: "24px",
            mb: 2,
          }}
        >
          Editar Tabla
        </DialogTitle>
  
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                setSlug(value.toLowerCase().replace(/\s+/g, "-"));
              }}
              fullWidth
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                marginTop: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: colors.purple },
                  "&.Mui-focused fieldset": { borderColor: colors.pink },
                },
                "& label": { fontSize: "14px" },
              }}
            />
  
            <TextField
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              fullWidth
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: colors.purple },
                  "&.Mui-focused fieldset": { borderColor: colors.pink },
                },
              }}
            />
  
            <TextField
              label="Icono"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              fullWidth
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: colors.purple },
                  "&.Mui-focused fieldset": { borderColor: colors.pink },
                },
              }}
            />
          </Box>
        </DialogContent>
  
        <DialogActions sx={{ justifyContent: "center", marginTop: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <NewButton label="Cancelar" onClick={onClose} />
            <SaveButton onClick={handleSave} />
          </Box>
        </DialogActions>
      </Dialog>
    );
  };
  