import { Box, Typography } from "@mui/material";
import { TestIAForm } from "../components/AI/TestIAForm";

export default function AIPage() {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        🤖 Configuración de IA
      </Typography>

      {/* Aquí se conecta al cliente activo */}
      <TestIAForm clientId="milkasa" />
    </Box>
  );
}
