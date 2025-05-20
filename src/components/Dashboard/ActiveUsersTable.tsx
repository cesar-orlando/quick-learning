import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useActiveUsers, useUserStats } from "../../hooks/useActiveUsers";

const MotionPaper = motion(Paper);

const ActiveUsersTable = () => {
  const { users, loading, error } = useActiveUsers();
  const { stats, loading: statsLoading, error: statsError } = useUserStats(users);

  const isLoading = loading || statsLoading;
  const hasError = error || statsError;

  if (isLoading) {
    return (
      <Box p={2} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box p={2}>
        <Typography color="error">Error al cargar usuarios o estadísticas.</Typography>
      </Box>
    );
  }

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        overflowX: "auto",
      }}
    >
      <Typography variant="h6" mb={2} fontWeight="bold" color="text.primary">
        Usuarios activos
      </Typography>

      <Table size="small" sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>
              <strong>Nombre</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Alumnos</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Clientes</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Prospectos</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Sin interacción</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => {
            const userStats = stats.find((s) => s.userId === user._id) || {
              alumnos: 0,
              clientes: 0,
              prospectos: 0,
              sinInteraccion: 0,
            };

            return (
              <TableRow
                key={user.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "#f0f4ff",
                    transition: "background-color 0.3s",
                  },
                }}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: userStats.alumnos === 0 ? "#ccc" : userStats.alumnos > 5 ? "#2ecc71" : "#2D8EFF",
                  }}
                >
                  {userStats.alumnos}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: userStats.clientes === 0 ? "#ccc" : userStats.clientes > 5 ? "#2ecc71" : "#24C48B",
                  }}
                >
                  {userStats.clientes}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: userStats.prospectos === 0 ? "#ccc" : userStats.prospectos > 5 ? "#2ecc71" : "#FFB300",
                  }}
                >
                  {userStats.prospectos}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color:
                      userStats.sinInteraccion === 0 ? "#ccc" : userStats.sinInteraccion < 5 ? "#2ecc71" : "#EF5350",
                  }}
                >
                  {userStats.sinInteraccion}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </MotionPaper>
  );
};

export default ActiveUsersTable;
