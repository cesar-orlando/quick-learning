import { Card, Menu, MenuItem, TextField } from "@mui/material";
import axios from "axios";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PromoterDetails = () => {
    const { id } = useParams(); // Obtiene el parámetro `id` de la URL
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const navigate = useNavigate();

    const handleGetEmployee = async () => {
        // Llama a la API para obtener la información del promotor
        await axios
            .get(`${process.env.REACT_APP_API_URL}/api/v1/monex/employees/${id}`)
            .then((response) => {
                console.log("response", response.data);
                setName(response.data.name);
                setPhone(response.data.phone);
                setEmail(response.data.email);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        handleGetEmployee();
    }, [])

    const handleUpdateEmployee = async () => {
        // Llama a la API para actualizar la información de la empresa
        await axios
            .put(`${process.env.REACT_APP_API_URL}/api/v1/monex/employees/edit/${id}`, {
                name: name,
                phone: phone,
                email: email,
            })
            .then((response) => {
                console.log("response", response.data);
                navigate('/promoter');
            })
            .catch((error) => {
                console.error(error);
            });
    }
    

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
            Detalles de empresa
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <TextField
                id="outlined-basic"
                label="Empresa"
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
                onClick={() => handleUpdateEmployee()}
                fullWidth
              >
                Actualizar empresa
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
};
export default PromoterDetails;
