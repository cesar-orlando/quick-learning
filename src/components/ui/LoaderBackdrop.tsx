import { Backdrop, Box, CircularProgress, Typography, Fade } from "@mui/material";

interface LoaderBackdropProps {
  open: boolean;
  text?: string;
}

const LoaderBackdrop = ({ open, text = "Cargando..." }: LoaderBackdropProps) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        color: "#fff",
        backdropFilter: "blur(3px)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
      transitionDuration={400}
    >
      <Fade in={open}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress thickness={4} size={60} sx={{ color: "#8B5CF6" }} />
          <Typography sx={{ fontWeight: "bold", color: "#fff" }}>{text}</Typography>
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default LoaderBackdrop;
