import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DataTable from "layouts/companies/components/DataTable";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Menu, Snackbar, Alert } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Loading from "components/Loading/Loading";
import Dropdown from "components/Dropdown/Dropdown";
import DropdownChat from "components/DropdownChat/DropDownChat";
import { customerService } from "services/customer";

function Customers() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(""); // Estado del filtro de status
  const [searchTerm, setSearchTerm] = useState(""); // Estado del campo de búsqueda
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ia, setIa] = useState(true); // Estado para manejar el valor de `ia`
  const [selectedItem, setSelectedItem] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const { data, loading, success } = await customerService.getCustomers(editCustomer, viewChat, handleToggleIA);
      setCustomer(data);
      setLoading(loading);
      if (success) {
        setSnackbarMessage("Datos cargados correctamente");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Error al cargar los datos");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Error al cargar los datos");
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
    }
  };

  const editCustomer = async (item, popupState) => {
    popupState.close();
    navigate(`/customer/${item._id}`);
    return;
  };
  const viewChat = async (item, popupState) => {
    popupState.close();
    navigate(`/customer/chat/${item._id}`);
  };

  // Filtrar datos según búsqueda y estado seleccionado
  const filteredCompanies = customer.filter((company) => {
    const matchesSearch = company.nameText.includes(searchTerm.toLowerCase()) ||
      company.phoneText.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || company.statusText === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleIA = async (item, popupState) => {
    popupState.close();
    const newIaValue = !item.ia; // Invertir el valor de `ia`
    let data = JSON.stringify({ ia: newIaValue });

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.REACT_APP_API_URL}/api/v1/quicklearning/update/${item._id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        setIa(newIaValue); // Actualizar el estado `ia`
        handleSuccess("Operación exitosa");
      })
      .catch((error) => {
        console.log(error);
        handleError("Ocurrió un error");
      }).finally(() => {
        getData();
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSuccess = (message) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  const handleError = (message) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semitransparente
            zIndex: 10, // Asegurarse de que esté por encima del contenido
          }}
        >
          <Loading /> {/* Usar el componente de carga aquí */}
        </Box>
      ) : (
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <MDTypography variant="h4" color="white">
                    Clientes
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} px={3} display="flex" justifyContent="space-between" alignItems="center">
                  {/* Campo de búsqueda */}
                  <MDInput
                    label="Buscar cliente..."
                    variant="outlined"
                    fullWidth
                    sx={{ maxWidth: 400 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {/* Filtro de status */}
                  <FormControl variant="outlined" sx={{ minWidth: 200, height: 56 }}>
                    <InputLabel sx={{ height: 50 }} id="status-filter-label">Filtrar por Estado</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Filtrar por Estado"
                      sx={{ height: 50 }}
                    >
                      <MenuItem value=""> 
                        <em>Todos</em>
                      </MenuItem>
                      <MenuItem value="En conversación">En conversación</MenuItem>
                      <MenuItem value="Prospecto">Prospecto</MenuItem>
                      <MenuItem value="Interesado">Interesado</MenuItem>
                      <MenuItem value="Sin interacción">Sin interacción</MenuItem>
                    </Select>
                  </FormControl>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Cliente", accessor: "name", align: "left" },
                        { Header: "Ultimo Mensaje", accessor: "lastmessage", align: "left" },
                        { Header: "Estado", accessor: "status", align: "center" },
                        { Header: "Acciones", accessor: "action", align: "center" },
                      ],
                      rows: filteredCompanies
                    }}
                    isSorted
                    entriesPerPage={false}
                    showTotalEntries={false}
                    canSearch={false} // Ya implementamos el search manualmente
                    noEndBorder
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      )}
      {selectedItem && (
        <DropdownChat
          lastMessage={selectedItem.lastMessage.body}
          lastMessageDate={new Date(selectedItem.lastMessage.dateCreated).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
        />
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Customers;
