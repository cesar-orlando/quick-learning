import { Modal, Box, Typography, Fade, Divider, IconButton } from "@mui/material";

interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  image: string;
  templateId: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  name: string;
  onSend: (method: PaymentMethod) => void;
}

export const PaymentModal = ({ open, onClose, paymentMethods, onSend }: PaymentModalProps) => {
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
              Selecciona un método de pago
            </Typography>
            <IconButton onClick={onClose} size="small">
              ✕
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Métodos de pago */}
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
            {paymentMethods.map((method) => {
            return(
              <Box
                key={method.id}
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #E0E0E0",
                  backgroundColor: "#F7F4FF",
                  boxShadow: "0 1px 4px rgba(123, 97, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#F5F5FF" },
                }}
                onClick={() => onSend(method)}
              >
                <img
                  src={method.image}
                  alt={method.label}
                  style={{ width: 64, height: 64, marginRight: 16, borderRadius: 8 }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {method.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {method.description}
                  </Typography>
                </Box>
              </Box>
            )})}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};