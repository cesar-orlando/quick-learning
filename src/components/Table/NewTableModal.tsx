import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Box,
  Collapse,
  Paper,
  Typography,
  Skeleton,
  Snackbar,
  Alert,
  Grid
} from "@mui/material";
import React, { useState } from "react";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { useSuggestIcons } from "../../hooks/useSuggestIcons.tsx";
import api from "../../api/axios.ts";
import { colors } from "../../theme/colors.tsx";
import { NewButton } from "../ui/NewButton.tsx";
import { SaveButton } from "../ui/SaveButton.tsx.tsx";

// 🔥 Animación suave para el modal
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface NewTableModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewTableModal = ({ open, onClose, onSuccess }: NewTableModalProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isSelectingIcon, setIsSelectingIcon] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "error" | "warning">("info");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { icons, loading, fetchIcons } = useSuggestIcons();

  const handleSubmit = async () => {
    if (!name || !slug || !selectedIcon) return;

    console.log("selectedIcon", selectedIcon);

    try {
      await api.post("/tables/create", { name, slug, icon: selectedIcon });

      // ✅ Mensaje de éxito
      setSnackbarMessage("¡Tabla creada exitosamente!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error creating table", error);

      if (error.response && error.response.status === 400) {
        setSnackbarMessage("Esta tabla ya existe.");
      } else {
        setSnackbarMessage("Ocurrió un error al crear la tabla.");
      }
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setSelectedIcon(null);
    setIsSelectingIcon(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
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
          Crear Nueva Tabla
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre de la tabla"
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", marginTop: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexDirection: "column", width: "100%" }}>
            {!isSelectingIcon && (
              <NewButton
                label="Elegir Icono"
                onClick={() => {
                  fetchIcons(name);
                  setIsSelectingIcon(true);
                }}
              />
            )}

            <Collapse in={isSelectingIcon}>
              <Grid container spacing={2} sx={{ marginTop: 2 }}>
                {loading
                  ? // 🔥 Si está cargando, mostrar skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                      <Grid key={index}>
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            aspectRatio: "1 / 1",
                            borderRadius: "20px",
                            minHeight: { xs: "60px", sm: "90px" },
                          }}
                        />
                      </Grid>
                    ))
                  : // 🔥 Cuando carga, mostrar los íconos reales
                    icons.map(({ emoji, label }) => (
                      <Grid key={label}>
                        <Paper
                          elevation={selectedIcon === label ? 6 : 1}
                          sx={{
                            aspectRatio: "1 / 1",
                            p: { xs: 1, sm: 2 },
                            borderRadius: { xs: "15px", sm: "20px" },
                            minHeight: { xs: "60px", sm: "90px" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: selectedIcon === label ? colors.purple : "#f9f9f9",
                            color: selectedIcon === label ? "#fff" : "#333",
                            transition: "all 0.3s",
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                            },
                          }}
                          onClick={() => setSelectedIcon(emoji)}
                        >
                          <Typography sx={{ fontSize: { xs: "30px", sm: "40px" } }}>{emoji}</Typography>
                        </Paper>
                      </Grid>
                    ))}
              </Grid>
            </Collapse>

            {selectedIcon && <SaveButton onClick={handleSubmit} />}
          </Box>
        </DialogActions>
        <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Dialog>

    </>
  );
};
