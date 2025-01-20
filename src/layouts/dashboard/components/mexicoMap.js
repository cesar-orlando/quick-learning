import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Card, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";

// Datos ficticios de los estados
const stateData = {
  Jalisco: { population: "8.3M", capital: "Guadalajara", sales: "500M" },
  México: { population: "17.4M", capital: "Toluca", sales: "1.2B" },
  "Nuevo León": { population: "5.7M", capital: "Monterrey", sales: "800M" },
  Puebla: { population: "6.5M", capital: "Puebla", sales: "450M" },
  Guanajuato: { population: "6.1M", capital: "Guanajuato", sales: "380M" },
  Veracruz: { population: "8.1M", capital: "Xalapa", sales: "400M" },
  Chiapas: { population: "5.5M", capital: "Tuxtla Gutiérrez", sales: "220M" },
  Oaxaca: { population: "4.1M", capital: "Oaxaca", sales: "310M" },
  Yucatán: { population: "2.3M", capital: "Mérida", sales: "260M" },
  Sonora: { population: "3.0M", capital: "Hermosillo", sales: "290M" },
};

// Ordenar por ventas y obtener los primeros 6 estados
const topSellingStates = Object.entries(stateData)
  .sort(([, a], [, b]) => parseFloat(b.sales) - parseFloat(a.sales))
  .slice(0, 6)
  .map(([state, data]) => ({ name: state, ...data }));

const MexicoMap = () => {
  const [selectedState, setSelectedState] = useState(null); // Estado seleccionado
  const [selectedGeo, setSelectedGeo] = useState(null); // Geo seleccionado

  const handleStateClick = (geo) => {
    const stateName = geo.properties.name;
    setSelectedGeo(geo.id); // Guardar el geo ID seleccionado
    setSelectedState(stateData[stateName] ? { name: stateName, ...stateData[stateName] } : null);
  };

  return (
    <Card
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "auto",
        marginBottom: "45px",
        marginTop: "45px",
      }}
    >
      <MDBox display="flex" pt={1} px={2} mt={-8}>
        <MDBox
          variant="gradient"
          bgColor={"success"}
          color={"dark" === "light" ? "dark" : "white"}
          coloredShadow={"dark"}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
        >
          <Icon fontSize="medium" color="inherit">
            {"language"}
          </Icon>
        </MDBox>
        <MDBox textAlign="center" lineHeight={1.25} ml={2}>
          <MDTypography variant="h2" fontWeight="light" color="title">
            {"Estados de México"}
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox display="flex" flexDirection="row" justifyContent="space-between">
        {/* Información y lista de estados */}
        <MDBox flex={1} paddingRight={4}>
          {/* Información del estado seleccionado */}
          <MDBox mb={4}>
            {selectedState ? (
              <>
                <Typography variant="h6">
                  <strong>{selectedState.name}</strong>
                </Typography>
                <Typography variant="body1">Población: {selectedState.population}</Typography>
                <Typography variant="body1">Capital: {selectedState.capital}</Typography>
                <Typography variant="body1">Ventas: {selectedState.sales}</Typography>
              </>
            ) : (
              <Typography variant="body1">Seleccione un estado para ver la información</Typography>
            )}
          </MDBox>

          {/* Lista de estados principales */}
          <Divider sx={{ marginBottom: 2 }} />
          <Typography variant="h6" gutterBottom>
            Estados con mayores ventas
          </Typography>
          <List>
            {topSellingStates.map((state) => (
              <ListItem
                key={state.name}
                onClick={() => setSelectedState(state)}
                style={{ cursor: "pointer" }}
              >
                <ListItemText primary={state.name} secondary={`Ventas: ${state.sales}`} />
              </ListItem>
            ))}
          </List>
        </MDBox>

        {/* Mapa interactivo */}
        <MDBox flex={2}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1200,
              center: [-100, 23],
            }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={"/features.json"}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleStateClick(geo)}
                    style={{
                      default: {
                        fill: selectedGeo === geo.id ? "#000000" : "#E8E8E8", // Cambiar a negro si está seleccionado
                        stroke: "#000",
                        outline: "none",
                      },
                      hover: {
                        fill: "#CFD8DC",
                        stroke: "#000",
                        outline: "none",
                      },
                      pressed: {
                        fill: "#B0BEC5",
                        stroke: "#000",
                        outline: "none",
                      },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </MDBox>
      </MDBox>
    </Card>
  );
};

export default MexicoMap;
