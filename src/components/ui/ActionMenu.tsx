// components/shared/ActionMenu.tsx
import {
    Menu,
    MenuItem,
    Divider,
    Fade,
    Typography,
  } from "@mui/material";
  
  interface ActionMenuProps {
    anchorEl: null | HTMLElement;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
  }
  
  export const ActionMenu = ({ anchorEl, onClose, onEdit, onDelete }: ActionMenuProps) => {
    const open = Boolean(anchorEl);
  
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        TransitionComponent={Fade}
        PaperProps={{
            sx: {
              borderRadius: "10px",
              minWidth: 180,
              backgroundColor: "#ffffff",
              color: "#111827",
              border: "1px solid #E5E7EB",
              boxShadow: "none", // ← sombra mucho más sutil
              mt: 1,
              overflow: "hidden",
              "& .MuiMenuItem-root": {
                fontSize: "14px",
                gap: 1,
                paddingY: 1,
                paddingX: 2,
                fontWeight: 500,
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F3F4F6",
                },
              },
            },
          }}          
      >
        {onEdit && (
          <MenuItem
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            <Typography sx={{ fontSize: "18px" }}>✏️</Typography>
            <Typography>Editar</Typography>
          </MenuItem>
        )}
  
        {onEdit && onDelete && <Divider sx={{ bgcolor: "#555" }} />}
  
        {onDelete && (
          <MenuItem
            onClick={() => {
              onClose();
              onDelete();
            }}
            sx={{
                color: "#DC2626", // rojo VV
                "&:hover": {
                  backgroundColor: "#FEE2E2", // rojo suave
                },
              }}
          >
            <Typography sx={{ fontSize: "18px" }}>🗑️</Typography>
            <Typography>Eliminar</Typography>
          </MenuItem>
        )}
      </Menu>
    );
  };
  
  export default ActionMenu;
  