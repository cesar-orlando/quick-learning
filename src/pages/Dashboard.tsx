import { Box, Card, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";

import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BlockIcon from "@mui/icons-material/Block";
import { motion } from "framer-motion";
import useDashboardCounts from "../hooks/useDashboardCounts";
import ActiveUsersTable from "../components/Dashboard/ActiveUsersTable";
import LoaderBackdrop from "../components/ui/LoaderBackdrop";

const MotionCard = motion(Card);

// Ciclos hardcodeados (puedes mover esto a un archivo aparte o traerlo de un endpoint)
const CYCLES = [
  { id: "2505", label: "2505", start: "2025-04-28", end: "2025-05-25" },
  { id: "2506", label: "2506", start: "2025-05-26", end: "2025-06-22" },
  { id: "2507", label: "2507", start: "2025-06-23", end: "2025-07-20" },
  { id: "2508", label: "2508", start: "2025-07-21", end: "2025-08-24" },
  { id: "2509", label: "2509", start: "2025-08-25", end: "2025-09-21" },
  { id: "2510", label: "2510", start: "2025-09-22", end: "2025-10-19" },
  { id: "2511", label: "2511", start: "2025-10-20", end: "2025-11-16" },
  { id: "2512", label: "2512", start: "2025-11-17", end: "2025-12-14" },
  { id: "2601", label: "2601", start: "2025-12-15", end: "2026-01-25" },
];

const YEARS = [2024, 2025, 2026];
const MONTHS = [
  { key: 0, label: "ene" },
  { key: 1, label: "feb" },
  { key: 2, label: "mar" },
  { key: 3, label: "abr" },
  { key: 4, label: "may" },
  { key: 5, label: "jun" },
  { key: 6, label: "jul" },
  { key: 7, label: "ago" },
  { key: 8, label: "sep" },
  { key: 9, label: "oct" },
  { key: 10, label: "nov" },
  { key: 11, label: "dic" },
];

const Dashboard = () => {
  // Nuevo estado para el modo de selección y fechas
  const [manualMode, setManualMode] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(CYCLES[0]);
  const [manualDates, setManualDates] = useState({
    start: CYCLES[0].start,
    end: CYCLES[0].end,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [modalMode, setModalMode] = useState<"month" | "range">("month");

  // Determinar fechas activas
  const startDate = manualMode ? manualDates.start : selectedCycle.start;
  const endDate = manualMode ? manualDates.end : selectedCycle.end;

  // Pasar fechas al hook
  const { alumnos, clientes, prospectos, sinInteraccion, loading, error } = useDashboardCounts({ startDate, endDate });
  const navigate = useNavigate();

  const dashboardData = [
    { label: "Alumnos", count: alumnos, slug: "alumnos", icon: <PersonIcon fontSize="large" />, color: "#2D8EFF" },
    { label: "Clientes", count: clientes, slug: "clientes", icon: <GroupIcon fontSize="large" />, color: "#24C48B" },
    {
      label: "Prospectos",
      count: prospectos,
      slug: "prospectos",
      icon: <StarBorderIcon fontSize="large" />,
      color: "#FFB300",
    },
    {
      label: "Sin interacción",
      count: sinInteraccion,
      slug: "sin-contestar",
      icon: <BlockIcon fontSize="large" />,
      color: "#EF5350",
    },
  ];

  const total = alumnos + clientes + prospectos + sinInteraccion;

  const MotionContainer = motion(Box);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Actualiza el rango de días por default al cambiar mes/año
  useEffect(() => {
    if (modalMode === "range") {
      const start = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const end = dayjs(start).endOf("month").format("YYYY-MM-DD");
      setCustomRange({ start, end });
    }
  }, [selectedYear, selectedMonth, modalMode]);

  // Al aplicar el filtro
  const handleApplyModal = () => {
    if (modalMode === "month") {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
      setManualDates({ start: startDate, end: endDate });
    } else {
      setManualDates({ start: customRange.start, end: customRange.end });
    }
    setManualMode(true);
    setOpenModal(false);
  };

  if (loading || error) {
    return <LoaderBackdrop open={loading} text="Cargando..." />;
  }

  return (
    <Box p={3}>
      {/* Selector de ciclo y fechas manuales */}
      <Card
        sx={{
          mb: 3,
          px: 3,
          py: 2,
          backgroundColor: "#ffffff",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
          {/* Botón para abrir el modal de mes/año */}
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#7B61FF",
              color: "#fff",
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#6b52e3" },
            }}
            onClick={() => setOpenModal(true)}
          >
            Filtrar por mes/año
          </Button>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="cycle-select-label">Ciclo</InputLabel>
            <Select
              labelId="cycle-select-label"
              value={selectedCycle.id}
              label="Ciclo"
              disabled={manualMode}
              onChange={(e) => {
                const found = CYCLES.find((c) => c.id === e.target.value);
                if (found) setSelectedCycle(found);
              }}
            >
              {CYCLES.map((cycle) => (
                <MenuItem key={cycle.id} value={cycle.id}>
                  {cycle.label} ({dayjs(cycle.start).format("DD/MM")} - {dayjs(cycle.end).format("DD/MM")})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mostrar solo el ciclo seleccionado o el rango de mes/año activo */}
          <Typography variant="body1" sx={{ minWidth: 240, fontWeight: 500 }}>
            {manualMode
              ? modalMode === "month"
                ? `Mes/año: ${dayjs(manualDates.start).format("MMMM YYYY")}`
                : `Rango: ${dayjs(manualDates.start).format("DD/MM/YYYY")} - ${dayjs(manualDates.end).format(
                    "DD/MM/YYYY"
                  )}`
              : `Ciclo: ${selectedCycle.label}`}
          </Typography>
          {/* Botón para volver a seleccionar ciclo si está en modo mes/año */}
          {manualMode && (
            <Button
              variant="outlined"
              onClick={() => setManualMode(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#7B61FF",
                border: "2px solid #7B61FF",
                borderRadius: 2,
                ml: 1,
                backgroundColor: "#fff",
                "&:hover": { backgroundColor: "#f0ebff" },
              }}
            >
              Volver a seleccionar ciclo
            </Button>
          )}
          {/* Loading spinner pequeño */}
          {loading && <CircularProgress size={24} sx={{ ml: 2, color: "#7B61FF" }} />}
        </Stack>
      </Card>

      {/* Modal de mes/año */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ backgroundColor: "#fff", borderRadius: 3, p: 3 }}>
          <Typography variant="h6" mb={2} fontWeight={700} color="#7B61FF">
            Filtrar por mes/año o rango de días
          </Typography>
          <ToggleButtonGroup value={modalMode} exclusive onChange={(_, val) => val && setModalMode(val)} sx={{ mb: 3 }}>
            <ToggleButton
              value="month"
              sx={{
                fontWeight: 600,
                color: modalMode === "month" ? "#fff" : "#7B61FF",
                backgroundColor: modalMode === "month" ? "#7B61FF" : "#fff",
                border: "1.5px solid #7B61FF",
                borderRadius: 2,
                px: 3,
              }}
            >
              Mes/Año
            </ToggleButton>
            <ToggleButton
              value="range"
              sx={{
                fontWeight: 600,
                color: modalMode === "range" ? "#fff" : "#7B61FF",
                backgroundColor: modalMode === "range" ? "#7B61FF" : "#fff",
                border: "1.5px solid #7B61FF",
                borderRadius: 2,
                px: 3,
              }}
            >
              Rango de días
            </ToggleButton>
          </ToggleButtonGroup>
          {modalMode === "month" ? (
            <>
              <ToggleButtonGroup
                value={selectedYear}
                exclusive
                onChange={(_, val) => val && setSelectedYear(val)}
                sx={{ mb: 3 }}
              >
                {YEARS.map((year) => (
                  <ToggleButton
                    key={year}
                    value={year}
                    sx={{ fontWeight: 600, color: "#7B61FF", borderRadius: 2, borderColor: "#7B61FF" }}
                  >
                    {year}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                {MONTHS.map((month) => (
                  <Button
                    key={month.key}
                    variant={selectedMonth === month.key ? "contained" : "outlined"}
                    onClick={() => setSelectedMonth(month.key)}
                    sx={{
                      width: 70,
                      m: 0.5,
                      backgroundColor: selectedMonth === month.key ? "#7B61FF" : "#fff",
                      color: selectedMonth === month.key ? "#fff" : "#7B61FF",
                      border: "1.5px solid #7B61FF",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: selectedMonth === month.key ? "0 2px 8px rgba(123,97,255,0.12)" : "none",
                    }}
                  >
                    {month.label}
                  </Button>
                ))}
              </Box>
            </>
          ) : (
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mt={2}>
              <TextField
                type="date"
                label="Inicio"
                value={customRange.start}
                onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="Fin"
                value={customRange.end}
                onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={handleApplyModal}
            variant="contained"
            sx={{
              backgroundColor: "#7B61FF",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#6b52e3" },
            }}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      {!loading && !error && (
        <MotionContainer
          display="flex"
          flexWrap="wrap"
          gap={3}
          justifyContent="flex-start"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {dashboardData.map((item) => (
            <MotionCard
              key={item.label}
              onClick={() => navigate(`/${item.slug}`)} // <-- Aquí usas el slug
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03 }}
              sx={{
                flex: "1 1 calc(25% - 24px)",
                minWidth: "260px",
                maxWidth: "100%",
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                p: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "140px",
                transition: "transform 0.2s ease-in-out",
                cursor: "pointer", // 👈 se ve clickeable
                "@media (max-width:1200px)": {
                  flex: "1 1 calc(50% - 24px)",
                },
                "@media (max-width:600px)": {
                  flex: "1 1 100%",
                },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                  {item.label}
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {item.count}
                </Typography>
              </Box>
              <Box sx={{ color: item.color, alignSelf: "flex-end" }}>{item.icon}</Box>
            </MotionCard>
          ))}
        </MotionContainer>
      )}

      {/* Tarjeta inferior de Total General con animación */}
      {!loading && !error && (
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: dashboardData.length * 0.1 }}
          whileHover={{ scale: 1.02 }}
          sx={{
            backgroundColor: "#fff",
            color: "#000",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            p: 3,
            mt: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 4,
          }}
        >
          {/* Total general numérico */}
          <Box textAlign={{ xs: "center", md: "left" }}>
            <Typography variant="h5" sx={{ opacity: 0.7 }}>
              Total general del mes
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {total}
            </Typography>
          </Box>

          {/* Pie chart */}
          <Box flex="1" minWidth={280} height={280} display="flex" justifyContent="center" alignItems="center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={[
                    { name: "Alumnos", value: alumnos },
                    { name: "Clientes", value: clientes },
                    { name: "Prospectos", value: prospectos },
                    { name: "Sin interacción", value: sinInteraccion },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  <Cell fill="#2D8EFF" />
                  <Cell fill="#24C48B" />
                  <Cell fill="#FFB300" />
                  <Cell fill="#EF5350" />
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </MotionCard>
      )}

      <ActiveUsersTable />
    </Box>
  );
};

export default Dashboard;
