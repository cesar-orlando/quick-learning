import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { exportRecordsToExcel } from "../../utils/exportRecordsToExcel";
import DownloadIcon from "@mui/icons-material/Download";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: boolean | string;
}

interface UserStats {
  userId: string;
  alumnos: number;
  clientes: number;
  prospectos: number;
  sinInteraccion: number;
}

interface UsersTableProps {
  users: User[];
  stats: UserStats[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UsersTable = ({ users, stats, onEdit, onDelete }: UsersTableProps) => {
  return (
    <Paper sx={{ mb: 4, mt: 2, borderRadius: 3, overflow: "hidden" }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} px={1}>
        <Button
          onClick={() => {
            // Prepara los datos para exportar
            const dataToExport = users.map((user) => {
              const userStats = stats.find((s) => s.userId === user._id) || {
                alumnos: 0,
                clientes: 0,
                prospectos: 0,
                sinInteraccion: 0,
              };
              return {
                Nombre: user.name,
                Rol: user.role === 'sales' ? 'Asesor' : user.role === 'viewer' ? 'Visualizar' : user.role === 'admin' ? 'Administrador' : user.role,
                Alumnos: userStats.alumnos,
                Clientes: userStats.clientes,
                Prospectos: userStats.prospectos,
                "Sin interacción": userStats.sinInteraccion,
                Estado: user.status === true || user.status === 'true' ? 'Activo' : 'Inactivo',
              };
            });
            exportRecordsToExcel(dataToExport, [
              { key: "Nombre", label: "Nombre" },
              { key: "Rol", label: "Rol" },
              { key: "Alumnos", label: "Alumnos" },
              { key: "Clientes", label: "Clientes" },
              { key: "Prospectos", label: "Prospectos" },
              { key: "Sin interacción", label: "Sin interacción" },
              { key: "Estado", label: "Estado" },
            ], "usuarios.xlsx");
          }}
          sx={{
            minWidth: "auto",
            padding: "6px",
            borderRadius: "12px",
            backgroundColor: "#22C55E",
            color: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            "&:hover": {
              backgroundColor: "#16A34A",
            },
          }}
        >
          <DownloadIcon sx={{ fontSize: 20 }} />
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell><strong>Nombre</strong></TableCell>
            <TableCell><strong>Rol</strong></TableCell>
            <TableCell align="center"><strong>Alumnos</strong></TableCell>
            <TableCell align="center"><strong>Clientes</strong></TableCell>
            <TableCell align="center"><strong>Prospectos</strong></TableCell>
            <TableCell align="center"><strong>Sin interacción</strong></TableCell>
            <TableCell><strong>Estado</strong></TableCell>
            <TableCell align="right"><strong>Acciones</strong></TableCell>
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
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role === 'sales' ? 'Asesor' : user.role === 'viewer' ? 'Visualizar' : user.role === 'admin' ? 'Administrador' : user.role}</TableCell>
                <TableCell align="center" sx={{ color: "#bbb", fontWeight: "bold" }}>
                  {userStats.alumnos}
                </TableCell>
                <TableCell align="center" sx={{ color: userStats.clientes > 0 ? "#24C48B" : "#bbb", fontWeight: "bold" }}>
                  {userStats.clientes}
                </TableCell>
                <TableCell align="center" sx={{ color: userStats.prospectos > 0 ? "#FFB300" : "#bbb", fontWeight: "bold" }}>
                  {userStats.prospectos}
                </TableCell>
                <TableCell align="center" sx={{ color: userStats.sinInteraccion > 0 ? "#EF5350" : "#bbb", fontWeight: "bold" }}>
                  {userStats.sinInteraccion}
                </TableCell>
                <TableCell>{user.status === true || user.status === 'true' ? '🟢 Activo' : '🔴 Inactivo'}</TableCell>
                <TableCell align="right">
                  <Button size="small" color="primary" onClick={() => onEdit(user)}>
                    <EditIcon />
                  </Button>
                  <Button size="small" color="error" onClick={() => onDelete(user._id)}>
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default UsersTable;
