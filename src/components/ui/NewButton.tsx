import { Button } from "@mui/material";
import { colors } from "../../theme/colors";

interface NewButtonProps {
  onClick: () => void;
  label: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const NewButton = ({ onClick, label, fullWidth = false, icon, disabled = false }: NewButtonProps) => {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant="contained"
      fullWidth={fullWidth}
      startIcon={icon}
      sx={{
        background: `linear-gradient(90deg, ${colors.pink} 0%, ${colors.purple} 50%, ${colors.blue} 100%)`,
        color: "#fff",
        fontWeight: 600,
        fontSize: "13px",
        borderRadius: "999px",
        padding: "6px 18px",
        textTransform: "none",
        minHeight: "34px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        '&:hover': {
          opacity: 0.95,
          transform: "scale(1.02)",
        },
      }}
    >
      {label}
    </Button>
  );
};
