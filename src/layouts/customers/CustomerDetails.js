import { Button, Card, Menu, MenuItem, Switch, TextField } from "@mui/material";
import axios from "axios";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CustomerDetails() {
  const { id } = useParams(); // Obtiene el parámetro `id` de la URL
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState("");
  const [classification, setClassification] = useState("");
  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");

  /* Parametros para visitas si aplica */
  const [branch, setBranch] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");

  /* Parametros para inscrito si aplica */
  const [consecutive, setConsecutive] = useState("");
  const [course, setCourse] = useState("");
  const [modality, setModality] = useState("");
  const [state, setState] = useState("");
  const [emailInscribed, setEmailInscribed] = useState("");
  const [marketing, setMarketing] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [promoter, setPromoter] = useState("");
  const [allPromoters, setAllPromoters] = useState([]);

  const [anchorElPromoter, setAnchorElPromoter] = useState(null);
  const [openPromoter, setOpenPromoter] = useState(false);

  const [anchorElStatus, setAnchorElStatus] = useState(null);
  const [openStatus, setOpenStatus] = useState(false);

  const navigate = useNavigate();

  const handleGetCompany = async () => {
    // Llama a la API para obtener la información de la empresa
    await axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/details/${id}`)
      .then((response) => {
        setName(response.data.customer.name);
        setPhone(response.data.customer.phone);
        setComments(response.data.customer.comments);
        setClassification(response.data.customer.classification);
        setStatus(response.data.customer.status);
        setBranch(response.data.customer.visitDetails.branch);
        setVisitDate(response.data.customer.visitDetails.visitDate);
        setVisitTime(response.data.customer.visitDetails.visitTime);
        setConsecutive(response.data.customer.enrollmentDetails.consecutive);
        setCourse(response.data.customer.enrollmentDetails.course);
        setModality(response.data.customer.enrollmentDetails.modality);
        setState(response.data.customer.enrollmentDetails.state);
        setEmailInscribed(response.data.customer.enrollmentDetails.email);
        setMarketing(response.data.customer.enrollmentDetails.marketing);
        setPaymentMethod(response.data.customer.enrollmentDetails.paymentMethod);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleGetPromoters = async () => {
    // Llama a la API para obtener la lista de promotores
    await axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/monex/employees/all`)
      .then((response) => {
        setAllPromoters(response.data.employees);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleUpdateCustomer = async () => {
    // Llama a la API para actualizar la información de la empresa
    let data = JSON.stringify({
      name: name,
      phone: phone,
      comments: comments,
      classification: classification,
      status: status,
      visitDetails: {
        branch: branch,
        date: visitDate,
        time: visitTime,
      },
      enrollmentDetails: {
        consecutive: consecutive,
        course: course,
        modality: modality,
        state: state,
        email: emailInscribed,
        source: marketing,
        paymentType: paymentMethod,
      },
      user: "676d66af22932ac7c09d787f",
      ia: true,
    });
    console.log("data", data);
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.REACT_APP_API_URL}/api/v1/quicklearning/update/${id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        navigate("/customer");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    handleGetCompany();
    //handleGetPromoters();
  }, []);

  // Classification
  const handleClickClassification = (event) => {
    setAnchorElPromoter(event.currentTarget);
    setOpenPromoter(true);
  };
  const handleCloseClassification = (option) => {
    if (option) setClassification(option);
    setAnchorElPromoter(null);
    setOpenPromoter(false);
  };

  // Status
  const handleClickStatus = (event) => {
    setAnchorElStatus(event.currentTarget);
    setOpenStatus(true);
  };
  const handleCloseStatus = (option) => {
    if (option) {
      if (option === "ACEPTADO") {
        option = 1;
      } else if (option === "PENDIENTE") {
        option = 2;
      } else if (option === "ELIMINADO") {
        option = 3;
      } else if (option === "ASIGNADO") {
        option = 4;
      }
    }
    console.log("option", option);
    setStatus(option);
    setAnchorElStatus(null);
    setOpenStatus(false);
  };

  const options = [
    "Prospecto",
    "No contesta",
    "No interesado por precio",
    "Número equivocado",
    "Error al seleccionar",
    "Alumno",
    "Ofrece servicios",
    "Otros",
  ];
  const statusOptions = [
    "Visita agendada",
    "Segunda llamada",
    "Inscrito con adelanto",
    "Inscrito PL completo",
    "Inscrito con promoción",
  ];
  const ITEM_HEIGHT = 48;

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
            Detalles del cliente
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
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
                label="Celular"
                variant="outlined"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Comentarios"
                variant="outlined"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2} display="flex" flexDirection="row" gap={2}>
              {/* Campo classification */}
              <TextField
                id="outlined-basic"
                label="Clasificación"
                variant="outlined"
                value={classification}
                aria-controls={openPromoter ? "fade-menu-status" : undefined}
                aria-haspopup="true"
                aria-expanded={openPromoter ? "true" : undefined}
                onClick={handleClickClassification}
                fullWidth
              />
              <Menu
                id="fade-menu-status"
                MenuListProps={{
                  "aria-labelledby": "fade-button-status",
                }}
                anchorEl={anchorElPromoter}
                open={openPromoter}
                onClose={handleCloseClassification}
                slotProps={{
                  paper: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: "20ch",
                    },
                  },
                }}
              >
                {options.map((option) => (
                  <MenuItem
                    key={option}
                    selected={option === classification}
                    onClick={() => handleCloseClassification(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
              {/* Campo Status */}
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
                MenuListProps={{
                  "aria-labelledby": "fade-button-status",
                }}
                anchorEl={anchorElStatus}
                open={openStatus}
                onClose={handleCloseStatus}
                slotProps={{
                  paper: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: "20ch",
                    },
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
            {status === "Visita agendada" && (
              <MDBox mb={2} display="flex" flexDirection="row" gap={2}>
                <TextField
                  id="outlined-basic"
                  label="Sucursal"
                  variant="outlined"
                  fullWidth
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
                <TextField
                  id="outlined-basic"
                  label="Hora"
                  variant="outlined"
                  fullWidth
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                />
              </MDBox>
            )}

            {status ===
              ("Inscrito con adelanto" || "Inscrito PL completo" || "Inscrito con promoción") && (
              <Fragment>
                <MDBox mb={2} display="flex" flexDirection="row" gap={2}>
                  <TextField
                    id="outlined-basic"
                    label="Consecutivo"
                    variant="outlined"
                    fullWidth
                    value={consecutive}
                    onChange={(e) => setConsecutive(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Curso"
                    variant="outlined"
                    fullWidth
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Modalidad"
                    variant="outlined"
                    fullWidth
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Estado"
                    variant="outlined"
                    fullWidth
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </MDBox>
                <MDBox mb={2} display="flex" flexDirection="row" gap={2}>
                  <TextField
                    id="outlined-basic"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={emailInscribed}
                    onChange={(e) => setEmailInscribed(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Marketing"
                    variant="outlined"
                    fullWidth
                    value={marketing}
                    onChange={(e) => setMarketing(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Metodo de pago"
                    variant="outlined"
                    fullWidth
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </MDBox>
              </Fragment>
            )}

            <MDBox display="flex" alignItems="center" ml={-1}>
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              ></MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => handleUpdateCustomer()}
                fullWidth
              >
                Actualizar cliente
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}

export default CustomerDetails;
