// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
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
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Typography,
} from "@mui/material";
import DataTable from "./components/DataTable";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MDAvatar from "components/MDAvatar";
import { useNavigate } from "react-router-dom";

// Data

function Promoter() {
  const [promoter, setPromoter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [dataPromoter, setDataPromoter] = useState([]);

  const navigate = useNavigate();


  const handleOpenModal = (item,popupState) => {
    popupState.close();
    setDataPromoter(item);
    setCompanies(item.companies);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCompanies([]);
    setDataPromoter([]);
    setOpenModal(false);
  };

  const getPromoters = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/monex/employees/employees-with-companies`)
        .then((res) => {
          const filterData = res.data.map((item) => {
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
              status: item.status,
              companies: item.companies,
              action: (
                <PopupState variant="popover" popupId="demo-popup-menu">
                  {(popupState) => (
                    <Fragment>
                      <MoreVertIcon color="#000000" {...bindTrigger(popupState)} />
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem onClick={() => handleOpenModal(item, popupState)}>Ver </MenuItem>
                        <MenuItem onClick={() => handleEditPromoter(item, popupState)}>Editar </MenuItem>
                        <MenuItem onClick={() => handleExportExcel(item, popupState)}>Export Excel</MenuItem>
                       {/*  <MenuItem onClick={popupState.close}>Monex</MenuItem>  */}
                      </Menu>
                    </Fragment>
                  )}
                </PopupState>
              ),
            };
          });
          setPromoter(filterData);
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
    getPromoters();
  }, []);

  const handleEditPromoter = (item,popupState) => {
    popupState.close();
    navigate(`/promoter/${item._id}`);
    return;
  }

  const handleExportExcel = (item, popupState) => {
    popupState.close();
    return window.open(
      `https://www.jetdan9878.online/api/v1/monex/employees/export-employees-companies?employeeIds=${item._id}`,
      "_blank"
    );
  };

  const columns = [
    { Header: "Empresas", accessor: "name", width: "35%", align: "left" },
    { Header: "Número", accessor: "phone", align: "left" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Acción", accessor: "action", align: "center" },
  ];

  const columnsCompanies = [
    { Header: "Empresas", accessor: "company", width: "35%", align: "left" },
    { Header: "Número", accessor: "phone", align: "left" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Acción", accessor: "action", align: "center" },
  ];

  const downloadExcel = () => {
    // Lógica para exportar a Excel
    return window.open(
      `https://www.jetdan9878.online/api/v1/monex/employees/export-employees-companies?employeeIds=${dataPromoter._id}`,
      "_blank"
    );
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
    <Fragment>
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
                    <MDTypography variant="h6" color="white">
                      Empresas
                    </MDTypography>
                  </MDBox>
                  <MDBox pt={3}>
                    <DataTable
                      table={{ columns: columns, rows: promoter }}
                      isSorted={true}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      canSearch={true}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}
      </DashboardLayout>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%", // Ajusta según sea necesario
            maxHeight: "80vh", // Limita la altura máxima del modal
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflow: "auto", // Habilita el scroll
            borderRadius: 2, // Opcional, redondea bordes
          }}
        >
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
            <MDTypography variant="h6" color="white">
              {dataPromoter.name}
            </MDTypography>
          </MDBox>
          <MDBox pt={3}>
            <UploadButton functionToCall={downloadExcel} />
            <DataTable
              table={{ columns: columnsCompanies, rows: companies }}
              isSorted={true}
              entriesPerPage={false}
              showTotalEntries={false}
              canSearch={true}
              noEndBorder
            />
          </MDBox>
        </Box>
      </Modal>
    </Fragment>
  );
}

export default Promoter;
