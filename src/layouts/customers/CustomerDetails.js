import { Button, Card, Menu, MenuItem, Switch, TextField } from "@mui/material";
import axios from "axios";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CustomerDetails() {
  const { id } = useParams(); // Obtiene el parámetro `id` de la URL
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppProfile, setWhatsAppProfile] = useState("");
  const [status, setStatus] = useState("");
  const [followUp, setFollowUp] = useState("");
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
        console.log("response", response);
        setName(response.data.customer.name);
        setPhone(response.data.customer.phone);
        setEmail(response.data.customer.email);
        setSocial(response.data.customer.social);
        setStatus(response.data.data.status);
        setWhatsAppNumber(response.data.customer.whatsAppNumber);
        setWhatsAppProfile(response.data.customer.whatsAppProfile);
        setFollowUp(response.data.customer.followup);
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
      email: email,
      social: social,
      followup: followUp,
      status: status,
      //"employeeId": promoter._id
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

  // Promoter
  const handleClickPromoter = (event) => {
    setAnchorElPromoter(event.currentTarget);
    setOpenPromoter(true);
  };
  const handleClosePromoter = (option) => {
    if (option) setPromoter(option);
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

  const options = ["ACEPTADO", "PENDIENTE", "ELIMINADO", "ASIGNADO"];
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
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Ubicación"
                variant="outlined"
                value={social}
                onChange={(e) => setSocial(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Seguimiento"
                variant="outlined"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox mb={2} display="flex" flexDirection="row" gap={2}>
              {/* Campo Promotor */}
              {/*               <TextField
                id="outlined-basic-2"
                variant="outlined"
                value={promoter.name}
                aria-controls={openPromoter ? "fade-menu-promoter" : undefined}
                aria-haspopup="true"
                aria-expanded={openPromoter ? "true" : undefined}
                onClick={handleClickPromoter}
                fullWidth
              />
              <Menu
                id="fade-menu-promoter"
                MenuListProps={{
                  "aria-labelledby": "fade-button-promoter",
                }}
                anchorEl={anchorElPromoter}
                open={openPromoter}
                onClose={handleClosePromoter}
                slotProps={{
                  paper: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: "20ch",
                    },
                  },
                }}
              >
                {allPromoters.map((option) => (
                  <MenuItem
                    key={option.name}
                    selected={option === promoter.name}
                    onClick={() => handleClosePromoter(option)}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Menu> */}

              {/* Campo Status */}
              <TextField
                id="outlined-basic"
                label="Status"
                variant="outlined"
                value={status ? options[status - 1] : ""}
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
                {options.map((option) => (
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
