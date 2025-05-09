import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useTheme, useMediaQuery } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import Tooltip from "@mui/material/Tooltip";
import SettingsIcon from "@mui/icons-material/Settings";

import * as XLSX from "xlsx";
import ClienteTable from "../components/Clientes/ClienteTable";
import { Cliente } from "../components/Clientes/types";
import { ClienteForm } from "../components/Clientes/ClienteForm";
import ClienteEditModal from "../components/Clientes/ClienteEditModal";
import ClienteSettings from "../components/Clientes/ClienteSettings";

export default function Clientes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /*     const styleModal = {
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "90%" : 500,
            maxHeight: "90vh", // ← altura máxima visible
            overflow: "auto",  // ← permite el scroll
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
        }; */

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editingFields, setEditingFields] = useState<
    {
      key: string;
      label: string;
      value: any;
      type?: string;
      options?: string[];
    }[]
  >([]);
  const [visibleFields, setVisibleFields] = useState<
    {
      key: string;
      label: string;
      type: string;
      options?: string[];
      required?: boolean;
      visible?: boolean;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allFields, setAllFields] = useState<
    {
      key: string;
      label: string;
      type?: string;
      options?: string[];
      visible: boolean;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false); // Estado para el loader

  const onSubmitCreate = async (data: any) => {
    setIsLoading(true); // Activa el loader
    try {
      const { name, phone, ...customFieldValues } = data;

      const cliente = {
        name,
        phone,
        customFields: visibleFields.map((field) => ({
          key: field.key,
          label: field.label,
          value: customFieldValues[field.key] ?? "",
          visible: field.visible,
          type: field.type,
          options: field.options || [],
        })),
      };

      await api.post("/customers", cliente);
      setOpen(false);
      fetchClientes();
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err);
      alert("Error al guardar cliente");
    } finally {
      setIsLoading(false); // Desactiva el loader
    }
  };

  const fetchClientes = async () => {
    setIsLoading(true); // Activa el loader
    try {
      const res = await api.get("/customers");
      setClientes(res.data);

      const firstCliente = res.data.find(
        (c: any) => c.customFields?.length > 0
      );
      const all =
        firstCliente?.customFields?.map((f: any) => ({
          key: f.key,
          label: f.label,
          type: f.type,
          options: f.options,
          visible: f.visible ?? true, // Asegura que siempre haya un valor para visible
        })) || [];

      // Incluye todos los campos, sin filtrar por `visible`
      setAllFields(all);
      setVisibleFields(all.map((f: any) => ({ ...f, type: f.type || "" }))); // Muestra todos los campos
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setIsLoading(false); // Desactiva el loader
    }
  };

  const openCreateModal = async () => {
    const res = await api.get("/customers");
    const firstCliente = res.data.find((c: any) => c.customFields?.length > 0);
    const visibles =
      firstCliente?.customFields
        ?.filter((f: any) => f.visible)
        .map((f: any) => ({
          key: f.key,
          label: f.label,
          type: f.type,
          options: f.options,
          visible: f.visible,
        })) || [];

    setVisibleFields(visibles.map((f: any) => ({ ...f, type: f.type || "" })));

    setOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    const fields = visibleFields.map((field) => {
      const existing = cliente.customFields?.find((f) => f.key === field.key);
      return {
        key: field.key,
        label: field.label,
        value: existing?.value ?? "",
        type: field.type,
        options: field.options ?? [],
        visible: field.visible,
      };
    });

    console.log("fields", fields);
    setEditingFields(fields);
    setEditOpen(true);
  };

  const handleDeleteCliente = async (id: string, name: string) => {
    const confirm = window.confirm(
      `¿Estás seguro de que quieres eliminar a "${name}"?`
    );

    if (!confirm) return;

    try {
      await api.delete(`/customers/${id}`);
      fetchClientes(); // refrescar lista
    } catch (error) {
      alert("Error al eliminar el cliente");
    }
  };

  const saveVisibilityChanges = async () => {
    try {
      await api.post("/customers/update-custom-fields-visibility", {
        fields: allFields.map(({ key, visible }) => ({ key, visible })),
      });
      fetchClientes();
      setSettingsOpen(false);
    } catch (err) {
      console.error("Error al actualizar visibilidad", err);
      alert("No se pudo guardar la configuración.");
    }
  };

  const handleDeleteField = async (key: string, label: string) => {
    const confirm = window.confirm(
      `¿Estás seguro de eliminar el campo "${label}"? Esta acción no se puede deshacer.`
    );
    if (!confirm) return;

    setIsLoading(true); // Activa el loader
    try {
      await api.delete(`/customers/delete-custom-field/${key}`);
      alert(`Campo "${label}" eliminado exitosamente.`);
      await fetchClientes(); // Refresca la lista de clientes y campos
      setSettingsOpen(false); // Cierra el modal de configuración
    } catch (error) {
      console.error("Error al eliminar campo:", error);
      alert("Hubo un problema al eliminar el campo.");
    } finally {
      setIsLoading(false); // Desactiva el loader
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const exportToExcel = () => {
    const data = clientes.map((cliente) => {
      const base: Record<string, any> = {
        Nombre: cliente.name,
        Teléfono: cliente.phone,
      };

      // Agrega todos los customFields como columnas individuales
      cliente.customFields?.forEach((field) => {
        if (!field.visible) return; // Solo agrega los visibles
        base[field.label] = field.value;
      });

      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    XLSX.writeFile(workbook, "clientes.xlsx");
  };

  return (
    <>
      {/* Loader bloqueante */}
      <Backdrop open={isLoading} style={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Resto del código */}
      <Container sx={{ mt: isMobile ? 2 : 4, px: isMobile ? 1 : 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Clientes
            </Typography>
            <TextField
              size="small"
              label="Buscar cliente"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Box>
            <Tooltip title="Exportar a Excel">
              <IconButton onClick={exportToExcel}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Agregar cliente">
              <IconButton onClick={openCreateModal}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Configurar campos">
              <IconButton onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Paper sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 600 }}>
            <ClienteTable
              clientes={clientes}
              visibleFields={visibleFields}
              searchTerm={searchTerm}
              onEdit={openEditModal}
              onDelete={handleDeleteCliente}
            />
          </Box>
        </Paper>
        <ClienteForm
          open={open}
          onClose={() => setOpen(false)}
          onSubmitCreate={onSubmitCreate}
          visibleFields={visibleFields}
          isLoading={isLoading}
        />
        <ClienteEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          cliente={editingCliente}
          editingFields={editingFields}
          setEditingFields={setEditingFields}
          onSave={async (updatedCliente) => {
            try {
              await api.put(`/customers/${updatedCliente._id}`, updatedCliente);
              setEditOpen(false);
              setEditingCliente(null);
              fetchClientes();
            } catch (error) {
              alert("Error al editar cliente");
            }
          }}
        />
        <ClienteSettings
          open={settingsOpen}
          allFields={allFields}
          setAllFields={setAllFields}
          onSave={saveVisibilityChanges}
          onDeleteField={handleDeleteField}
          onClose={() => setSettingsOpen(false)}
          onAddField={async (field) => {
            await api.post("/customers/add-custom-field", {
              key: field.key.trim(),
              label: field.label.trim(),
              type: field.type,
              options:
                field.type === "select"
                  ? field.options?.filter((o) => o.trim())
                  : [],
            });
            fetchClientes();
            setSettingsOpen(false);
          }}
          isLoading={isLoading}
          fetchClientes={fetchClientes}
        />
      </Container>
    </>
  );
}
