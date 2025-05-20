import { Box, Card, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BlockIcon from "@mui/icons-material/Block";
import { motion } from "framer-motion";
import useDashboardCounts from "../hooks/useDashboardCounts";
import ActiveUsersTable from "../components/Dashboard/ActiveUsersTable";

const MotionCard = motion(Card);

const Dashboard = () => {
  const { alumnos, clientes, prospectos, sinInteraccion, loading, error } = useDashboardCounts();
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

  if (loading || error) {
    return (
      <Box p={4} textAlign="center">
        <Typography color={error ? "error" : "textSecondary"}>
          {error ? "Error al cargar los datos del dashboard." : "Cargando..."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
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

      {/* Tarjeta inferior de Total General con animación */}
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

      <ActiveUsersTable />
    </Box>
  );
};

export default Dashboard;
