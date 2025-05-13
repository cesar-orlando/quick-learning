import { useState } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LoaderBackdrop from "../ui/LoaderBackdrop";
import api from "../../api/axios";

interface Field {
  key: string;
  label: string;
  type: string;
  visible?: boolean;
}

interface UsersTableProps {
  users: any[];
  fields: Field[];
  fetchUsers: () => Promise<void>;
  onEdit: (user: any) => void;
  sortField: string;
  setSortField: (v: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: "asc" | "desc") => void;
}

const UsersTable = ({
  users,
  fields,
  fetchUsers,
  onEdit,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
}: UsersTableProps) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      setLoading(true);
      await api.delete(`/user/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <LoaderBackdrop open={loading} text="Procesando..." />
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Table
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 800,
            "& thead th": {
              backgroundColor: "#F9FAFB",
              color: "#374151",
              fontWeight: "bold",
              fontSize: "13px",
              paddingY: 1.5,
              borderBottom: "1px solid #E5E7EB",
              cursor: "pointer",
            },
            "& tbody td": {
              fontSize: "14px",
              color: "#374151",
              borderBottom: "1px solid #F3F4F6",
              paddingY: 1.3,
            },
            "& tbody tr:hover": {
              backgroundColor: "#FAFAFA",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {fields.map(
                (field) =>
                  field.visible !== false && (
                    <TableCell
                      key={field.key}
                      onClick={() => handleSort(field.key)}
                      sx={{
                        textTransform: "capitalize",
                      }}
                    >
                      {field.label}
                      {sortField === field.key && (sortOrder === "asc" ? " ↑" : " ↓")}
                    </TableCell>
                  )
              )}
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              return (
                <TableRow key={user._id}>
                  {fields.map((field) => {
                    console.log("field --->", field);
                    return (
                      <TableCell key={field.key}>
                        {user[field.key] == "sales"
                          ? "Asesor"
                          : user[field.key] == "viewer"
                          ? "Visualizar"
                          : user[field.key] == "admin"
                          ? "Administrador"
                          : `${user[field.key]}` == "true"
                          ? "🟢 Activo"
                          : `${user[field.key]}` == "false"
                          ? "🔴 Inactivo"
                          : `${user[field.key]}`}
                      </TableCell>
                    );
                  })}
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => onEdit(user)} aria-label="Editar usuario">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteUser(user._id)} aria-label="Eliminar usuario">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};

export default UsersTable;
