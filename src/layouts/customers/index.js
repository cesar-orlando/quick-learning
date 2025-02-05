// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "layouts/companies/components/DataTable";
import data from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";

// Importaciones adicionales
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import UploadButton from "components/UploadButton/UploadButton";
import MDInput from "components/MDInput";
import { Autocomplete, Menu, MenuItem, Typography } from "@mui/material";
import Header from "layouts/profile/components/Header";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import MDButton from "components/MDButton";

// Data

function Customer() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCustomers = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/list`)
        .then((res) => {
          console.log("res", res.data.customers);
          const filterData = res.data.customers.map((item) => {
            return {
              name: (
                <MDBox display="flex" alignItems="left">
                  <MDBox
                    lineHeight={1}
                    sx={{
                      maxWidth: "200px", // Fija el ancho máximo del contenedor
                      whiteSpace: "normal", // Permite saltos de línea
                      wordWrap: "break-word", // Ajusta palabras largas
                      overflowWrap: "break-word", // Compatibilidad adicional
                    }}
                  >
                    <MDTypography
                      display="block"
                      variant="button"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: "normal", // Forza saltos de línea
                        wordWrap: "break-word", // Ajusta palabras largas
                        overflowWrap: "break-word", // Compatibilidad adicional
                      }}
                    >
                      {item.name}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      sx={{
                        whiteSpace: "normal", // Forza saltos de línea
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {item.email}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              ),
              phone: item.phone,
              comments: (
                <MDBox display="flex" alignItems="left">
                  <MDBox
                    lineGeight={1}
                    fontSize={16}
                    sx={{
                      maxWidth: "300px", // Fija el ancho máximo del contenedor
                      whiteSpace: "normal", // Permite saltos de línea
                      wordWrap: "break-word", // Ajusta palabras largas
                      overflowWrap: "break-word", // Compatibilidad adicional
                    }}
                  >
                    <MDTypography
                      display="block"
                      variant="button"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: "normal", // Forza saltos de línea
                        wordWrap: "break-word", // Ajusta palabras largas
                        overflowWrap: "break-word", // Compatibilidad adicional
                      }}
                    >
                      {item.comments}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              ),
              status: item.status,
              employee: "Eduardo",
              action: (
                <PopupState variant="popover" popupId="demo-popup-menu">
                  {(popupState) => (
                    <Fragment>
                      <MoreVertIcon color="#000000" {...bindTrigger(popupState)} />
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem onClick={() => editCustomer(item, popupState)}>Editar </MenuItem>
                        <MenuItem onClick={() => viewChat(item, popupState)}>Ver Chat </MenuItem>
                      </Menu>
                    </Fragment>
                  )}
                </PopupState>
              ),
            };
          });
          setCompanies(filterData);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  const columns = [
    { Header: "Cliente", accessor: "name", width: "15%", align: "left" },
    { Header: "Número", accessor: "phone", align: "left" },
    { Header: "Comentarios", accessor: "comments", align: "center" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Asesor", accessor: "employee", align: "center" },
    { Header: "Acciones", accessor: "action", align: "center" },
  ];

  const editCustomer = async (item, popupState) => {
    popupState.close();
    navigate(`/customer/${item._id}`);
    return;
  };
  const viewChat = async (item, popupState) => {
    popupState.close();
    navigate(`/customer/chat/${item._id}`);
  };

  const downloadExcel = () => {
    return console.log("Descargando Excel");
  };

  const createCustomer = () => {
    return console.log("Creando Cliente");
  };

  const renderSkeletonTable = () => {
    return (
      <MDBox pt={6} pb={3}>
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
            display="flex"
            alignItems="center"
          >
            <CircularProgress color="inherit" size={24} />
            <MDTypography variant="h6" color="white" marginLeft={"15px"}>
              Cargando Empresas...
            </MDTypography>
          </MDBox>
          <MDBox pt={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((col, index) => (
                      <TableCell key={index} style={{ textAlign: col.align }}>
                        <Skeleton
                          variant="text"
                          width={`${Math.random() * (80 - 50) + 50}%`} // Variable width for more realism
                          height={20}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton variant="rectangular" height={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>
        </Card>
      </MDBox>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {loading ? (
        renderSkeletonTable()
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
                <MDBox pt={3}>
                  <MDBox sx={{ display: "flex", justifyContent: "space-between" }}>
                    <MDButton
                      color="info"
                      style={{ marginLeft: "16px" }}
                      coloredShadow="info"
                      px={5}
                      onClick={() => navigate("/add-customer")} // Redirect to create promotion page
                    >
                      <MDTypography variant="h6" color="white" onClick={createCustomer}>
                        Crear Cliente
                      </MDTypography>
                    </MDButton>
                    <MDBox px={3}>
                      <UploadButton functionToCall={downloadExcel} />
                    </MDBox>
                  </MDBox>

                  <DataTable
                    table={{ columns: columns, rows: companies }}
                    isSorted={true}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    canSearch={true}
                    noEndBorder
                    func
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      )}
    </DashboardLayout>
  );
}

export default Customer;
