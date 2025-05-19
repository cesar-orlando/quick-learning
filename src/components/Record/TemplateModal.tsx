import { Modal, Box, Typography, Button, Fade, Divider, IconButton } from "@mui/material";

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  templates: {
    id: string;
    label: string;
    preview: string;
    variables: string[];
  }[];
  onSend: (templateId: string, preview: string) => void;
  name: string;
}

export const TemplateModal = ({ open, onClose, templates, onSend, name }: TemplateModalProps) => {
  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 520,
            maxHeight: "80vh",
            bgcolor: "#fff",
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            p: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="#7B61FF">
              Selecciona una plantilla
            </Typography>
            <IconButton onClick={onClose} size="small">
              ✕
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Scrollable body */}
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
            {templates.map((template, index) => {
              const preview = template.preview.replace("{{1}}", name || "amigo/a");
              return (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid #E0E0E0",
                    backgroundColor: "#F7F4FF",
                    boxShadow: "0 1px 4px rgba(123, 97, 255, 0.1)",
                  }}
                >
                  <Typography fontWeight={600} color="#333" sx={{ mb: 1 }}>
                    {template.label}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      p: 2,
                      borderRadius: 2,
                      fontFamily: "monospace",
                      fontSize: "0.95rem",
                      whiteSpace: "pre-wrap",
                      border: "1px solid #DDD",
                      mb: 2,
                      color: "#333",
                    }}
                  >
                    {preview}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#7B61FF",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      ":hover": { backgroundColor: "#6C54E0" },
                    }}
                    onClick={() => onSend(template.id, preview)}
                  >
                    Enviar esta plantilla
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};
