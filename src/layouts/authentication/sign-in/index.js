import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material"; // Importa Snackbar y Alert
import BasicLayout from "layouts/authentication/components/BasicLayout"; // Asegúrate de importar tu componente
import Card from "@mui/material/Card"; // Asegúrate de importar tu componente
import bgImage from "assets/images/bg-sign-in-basic.jpeg"; // Asegúrate de importar tu imagen

// @mui material components
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Images
import { TextField } from "@mui/material";

const SignIn = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleLogin = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/v1/user/login`, {
        email,
        password,
        //company:"QuickLearning"
      })
      .then((response) => {
        console.log(response.data.user._id);
        sessionStorage.setItem("user", response.data.user._id);
        sessionStorage.setItem("token", response?.data.token);
        sessionStorage.setItem("permissions", response.data.user.permissions);
        setSnackbarMessage("Inicio de sesión exitoso");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        console.log(error);
        setSnackbarMessage("Error al iniciar sesión");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
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
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
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
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth onClick={handleLogin}>
                sign in
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Card>
    </BasicLayout>
  );
};

export default SignIn;
