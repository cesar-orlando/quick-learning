import React, { useState, useEffect } from "react";
import {
  Card,
  TextField,
  Typography,
  Menu,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import withAuth from "middleware/withJWT";
import { useNavigate } from "react-router-dom";

const ITEM_HEIGHT = 48;

function AddPromotion() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [status, setStatus] = useState("");
  const [anchorElStatus, setAnchorElStatus] = useState(null);
  const [openStatus, setOpenStatus] = useState(false);
  const [showSelectedCustomers, setShowSelectedCustomers] = useState(false); // Mostrar/Ocultar clientes seleccionados
  const [file, setFile] = useState(null); // Archivo subido
  const navigate = useNavigate();

  const statusOptions = [
    "Visita agendada",
    "Segunda llamada",
    "Inscrito con adelanto",
    "Inscrito PL completo",
    "Inscrito con promoción",
  ];

  // Cargar lista de clientes al montar el componente
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/list`)
      .then((res) => {
        setCustomers(res.data.customers);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Manejo del menú de status
  const handleClickStatus = (event) => {
    setAnchorElStatus(event.currentTarget);
    setOpenStatus(true);
  };

  const handleCloseStatus = (selectedStatus) => {
    if (selectedStatus) {
      setStatus(selectedStatus);
      const customersByStatus = customers.filter((customer) => customer.status === selectedStatus);

      // Agregar todos los clientes de esa categoría a los seleccionados
      setSelectedCustomers((prevSelected) => {
        const currentSelectedIds = new Set(prevSelected.map((c) => c._id));
        const newCustomers = customersByStatus.filter(
          (customer) => !currentSelectedIds.has(customer._id)
        );
        return [...prevSelected, ...newCustomers];
      });

      console.log("selectedCustomers", selectedCustomers);
    }
    setAnchorElStatus(null);
    setOpenStatus(false);
  };

  const handleAddPromotion = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/v1/promo`, {
        name,
        description,
        startDate,
        endDate,
        selectedCustomers: selectedCustomers.map((customer) => customer._id),
        status: 1,
      })
      .then((res) => {
        console.log(res);
        navigate("/promotions");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Manejar archivo seleccionado
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ marginTop: 25 }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Crear Promoción
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            {/* Campos de texto */}
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Nombre"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Descripción"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
            </MDBox>

            {/* Fechas */}
            <MDBox mb={2}>
              <TextField
                id="start-date"
                label="Fecha de Inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <TextField
                id="end-date"
                label="Fecha de Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </MDBox>

            {/* Campo Status */}
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Status"
                variant="outlined"
                value={status}
                aria-controls={openStatus ? "fade-menu-status" : undefined}
                aria-haspopup="true"
                aria-expanded={openStatus ? "true" : undefined}
                onClick={handleClickStatus}
                fullWidth
              />
              <Menu
                id="fade-menu-status"
                anchorEl={anchorElStatus}
                open={openStatus}
                onClose={() => setOpenStatus(false)}
                MenuListProps={{
                  "aria-labelledby": "fade-button-status",
                }}
                PaperProps={{
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: "20ch",
                  },
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem
                    key={option}
                    selected={option === status}
                    onClick={() => handleCloseStatus(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </MDBox>

            {/* Botón para visualizar clientes seleccionados */}
            { selectedCustomers == [] ?
              <MDBox mb={2}>
                <Typography variant="body1">No hay clientes seleccionados</Typography>
              </MDBox>
            
            : status && (
              <MDBox mb={2}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => setShowSelectedCustomers(!showSelectedCustomers)}
                >
                  {showSelectedCustomers
                    ? "Ocultar Clientes Seleccionados"
                    : "Visualizar Clientes Seleccionados"}
                </MDButton>
              </MDBox>
            )}

            {/* Tabla de clientes seleccionados */}
            { showSelectedCustomers && (
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table stickyHeader sx={{ tableLayout: "auto" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left" sx={{ fontWeight: "bold" }}>
                        Nombre
                      </TableCell>
                      <TableCell align="left" sx={{ fontWeight: "bold" }}>
                        Teléfono
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Acción
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell align="left">{customer.name}</TableCell>
                        <TableCell align="left">{customer.phone}</TableCell>
                        <TableCell align="center">
                          <MDButton
                            color="error"
                            size="small"
                            onClick={() =>
                              setSelectedCustomers((prev) =>
                                prev.filter((c) => c._id !== customer._id)
                              )
                            }
                          >
                            Quitar
                          </MDButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Campo para subir archivo */}
            <MDBox mb={2}>
              <Typography variant="body1">Subir Imagen o Video</Typography>
              <input
                accept="image/*,video/*"
                type="file"
                onChange={handleFileChange}
                style={{ marginTop: "10px" }}
              />
              {file && (
                <MDBox mt={2}>
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Vista previa"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  ) : (
                    <video
                      controls
                      src={URL.createObjectURL(file)}
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  )}
                </MDBox>
              )}
            </MDBox>

            {/* Botón para crear promoción */}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" onClick={handleAddPromotion} fullWidth>
                Crear Promoción
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(AddPromotion);
