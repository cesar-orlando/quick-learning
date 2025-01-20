import { Button, Card, Grid } from "@mui/material";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "layouts/companies/components/DataTable";
import withAuth from "middleware/withJWT";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handlePromotion = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/promo`)
      .then((res) => {
        setPromotions(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handlePromotion();
  }, []);

  const columns = [
    { Header: "Nombre", accessor: "name" },
    { Header: "Descripción", accessor: "description" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {
        // Loading
        loading ? (
          <MDBox pt={6} pb={3}>
            <MDBox display="flex" justifyContent="center">
              <MDTypography variant="h6" color="text">
                Cargando...
              </MDTypography>
            </MDBox>
          </MDBox>
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
                      Promociones
                    </MDTypography>
                  </MDBox>
                  <MDBox p={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ margin: 2 }}
                      onClick={() => {
                        // Redirect to create promotion page
                        navigate("/add-promotion");
                      }}
                    >
                      <MDTypography variant="h6" color="white">
                        Crear promoción
                      </MDTypography>
                    </Button>
                  </MDBox>
                  <DataTable
                    table={{ columns: columns, rows: promotions }}
                    isSorteable={true}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    canSearch={true}
                    noEndBorder
                  />
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )
      }
    </DashboardLayout>
  );
}

export default withAuth(Promotions);
