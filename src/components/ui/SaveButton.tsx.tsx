import { Button } from "@mui/material";
import { colors } from "../../theme/colors";

export const SaveButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        background: `linear-gradient(90deg, ${colors.pink} 0%, ${colors.purple} 50%, ${colors.blue} 100%)`,
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "8px", // Menos redondeado para look más serio
        textTransform: "none",
        padding: "8px 16px", // 🔥 Antes era "12px 24px", ahora más compacto
        fontSize: "14px", // 🔥 Un poco más chico
        minWidth: "110px", // 🔥 Así no se ven aplastados
        '&:hover': {
          opacity: 0.9,
          transform: "scale(1.02)",
        }
      }}
      
      
    >
      Guardar
    </Button>
  );
};
