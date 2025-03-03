import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useMaterialUIController } from "context";

function DashboardLayout({ children }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: "100vh",
        transition: "margin 0.3s ease-in-out",
        marginLeft: miniSidenav ? "80px" : "20px", // Ajusta el margen cuando el menú cambia
        width: miniSidenav ? "calc(100% - 0px)" : "calc(100% - 20px)", // Ajusta el ancho del contenido
        marginTop: "14px", // Ajusta el margen superior para evitar el menú
      }}
    >
      {children}
    </Box>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
