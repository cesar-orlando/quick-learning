import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import { Box, Typography, Button, Chip, Stack, TextField, Drawer, Divider } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import { MenuItem, Select } from "@mui/material";

import Lottie from "lottie-react";
import TuneIcon from "@mui/icons-material/Tune";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import emptyAnimation from "../assets/empty.json";
import { NewRecordModal } from "../components/Record/NewRecordModal";
import { RecordTable } from "../components/Record/RecordTable";
import RecordEditModal from "../components/Record/RecordEditModal";
import RecordSettings from "../components/Record/RecordSettings";
import FilterPanel from "../components/Record/FilterPanel";
import LoaderBackdrop from "../components/ui/LoaderBackdrop";
import ProspectDrawer from "../components/Record/ProspectDrawer";

function TablePage() {
  const { slug } = useParams<{ slug: string }>();
  const [records, setRecords] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewRecord, setOpenNewRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingFields, setEditingFields] = useState<any[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ [key: string]: { start: string; end: string } }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const initialDateField = useMemo(() => {
    if (dateRange.lastMessageTime?.start || dateRange.lastMessageTime?.end) return "lastMessageTime";
    if (dateRange.createdAt?.start || dateRange.createdAt?.end) return "createdAt";
    return "createdAt";
  }, [dateRange]);
  
  const [dateRangeField, setDateRangeField] = useState<"createdAt" | "lastMessageTime">(initialDateField);
  
  const [tempDateRange, setTempDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (!slug) return;
    fetchRecords();
  }, [slug]);
  
  useEffect(() => {
    const fieldRange = dateRange[dateRangeField];
    if (fieldRange?.start || fieldRange?.end) {
      setTempDateRange([
        fieldRange.start ? new Date(fieldRange.start) : null,
        fieldRange.end ? new Date(fieldRange.end) : null,
      ]);
    } else {
      setTempDateRange([null, null]);
    }
  }, [dateRangeField, showAdvancedFilters]);
  

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin) {
        // Si es administrador, usar el endpoint general
        res = await api.get(`/records/${slug}`);
      } else {
        // Si no es administrador, usar el endpoint específico del asesor
        const asesorId = user.id; // Obtener el ID del usuario desde localStorage
        res = await api.get(`/whatsapp/prospect/${asesorId}`);
      }

      const recordsFetched = res.data.records;
      setRecords(recordsFetched);

      // 🔥 Automáticamente armar fields desde el primer registro
      const firstRecord = recordsFetched.find((r: any) => r.customFields?.length > 0);
      if (firstRecord) {
        const dynamicFields = firstRecord.customFields.map((field: any) => ({
          key: field.key,
          label: field.label,
          type: field.type,
          options: field.options,
          visible: field.visible ?? true,
          format: field.format,
        }));
        setFields(dynamicFields);
      } else {
        setFields([]); // Si no hay registros aún
      }
    } catch (error) {
      console.error("Error al traer registros:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditRecordModal = (record: any) => {
    setEditingRecord(record);
    setEditingFields(
      record.customFields.map((field: any) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        options: field.options,
        visible: field.visible,
        value: field.value,
      }))
    );
    setOpenEditModal(true);
  };

  const handleOpenDrawer = (record: any) => {
    setSelectedRecord(record);
    setEditingFields(
      record.customFields.map((field: any) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        options: field.options,
        visible: field.visible,
        value: field.value,
      }))
    );
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  };

  const saveEditedRecord = async (updatedRecord: any) => {
    setLoading(true);
    console.log("updatedRecord", updatedRecord);
    try {
      console.log("entro en el try");
      await api.put(`/records/update/${updatedRecord._id}`, {
        customFields: updatedRecord.customFields,
      });
      setDrawerOpen(false);
      setOpenEditModal(false);
      fetchRecords();
      console.log("todo bien");
    } catch (error) {
      console.error("Error al editar el registro:", error);
      alert("Error al editar el registro");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    let result = records.filter((record) => {
      const matchSearch = record.customFields?.some((field: any) => {
        const val = field?.value;
        if (field?.type === "file") return false;
        if (Array.isArray(val)) {
          return val.some((v) => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return val?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });

      const matchFilters = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const field = record.customFields?.find((f: any) => f.key === key);
        return field?.value?.toString().toLowerCase().includes(filterValue.toLowerCase());
      });

      const matchDates = Object.entries(dateRange).every(([key, range]) => {
        let value = "";

        if (key === "createdAt") {
          value = record.createdAt;
        } else {
          console.log("key", key);
          value = record.customFields?.find((f: any) => f.key === key)?.value;
        }

        if (!value) return true;

        const date = new Date(value);
        const start = range.start ? new Date(range.start) : null;
        const end = range.end ? new Date(range.end) : null;

        return (!start || date >= start) && (!end || date <= end);
      });

      return matchSearch && matchFilters && matchDates;
    });

    // Ordenar
    if (sortField) {
      result = result.sort((a, b) => {
        const valA = a.customFields?.find((f: any) => f.key === sortField)?.value;
        const valB = b.customFields?.find((f: any) => f.key === sortField)?.value;

        const aNum = typeof valA === "string" && !isNaN(Date.parse(valA)) ? new Date(valA).getTime() : Number(valA);
        const bNum = typeof valB === "string" && !isNaN(Date.parse(valB)) ? new Date(valB).getTime() : Number(valB);

        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      });
    }

    return result;
  }, [records, searchTerm, filters, dateRange, sortField, sortOrder]);

  const hasFilters =
    Object.values(filters).some((val) => !!val) ||
    Object.values(dateRange).some(({ start, end }) => start || end) ||
    searchTerm !== "";

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortField("");
    setSortOrder("asc");
    setDateRange({});
  };

  if (loading) {
    return (
      <>
        <LoaderBackdrop open={loading} text="Cargando..." />
      </>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
          gap: 1,
        }}
      >
        {/* 🧾 Título de la tabla */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 2,
            gap: 1,
          }}
        >
          {/* 🧾 Título */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {slug}
          </Typography>

          {/* Botones: izquierda (+Nuevo + 🔍) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {/* + Nuevo */}
            <Button
              onClick={() => setOpenNewRecord(true)}
              variant="contained"
              size="small"
              sx={{
                background: "linear-gradient(90deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)",
                color: "#fff",
                fontSize: "13px",
                borderRadius: "999px",
                padding: "4px 14px",
                textTransform: "none",
                minHeight: "30px",
                "&:hover": { opacity: 0.95 },
              }}
            >
              + Nuevo Registro
            </Button>

            {/* 🔍 Botón de búsqueda animada */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Button
                size="small"
                onClick={() => setShowSearch((prev) => !prev)}
                sx={{
                  minWidth: 0,
                  borderRadius: "999px",
                  padding: "6px",
                  color: "#3B82F6",
                }}
              >
                <SearchIcon />
              </Button>

              <Box
                sx={{
                  width: showSearch ? 200 : 0,
                  overflow: "hidden",
                  transition: "width 0.3s ease",
                  ml: 1,
                }}
              >
                <TextField
                  inputRef={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => setShowSearch(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowSearch(false);
                  }}
                  variant="standard"
                  placeholder="Buscar..."
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: "14px",
                      padding: "6px 1px",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Botones: derecha (Filtros + Configurar) */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            startIcon={<TuneIcon sx={{ fontSize: 18 }} />}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "13px",
              borderRadius: "999px",
              padding: "4px 12px",
              textTransform: "none",
              minHeight: "30px",
            }}
          >
            {showAdvancedFilters ? "Ocultar filtros" : "Filtros"}
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setOpenSettings(true)}
              startIcon={<SettingsIcon sx={{ fontSize: 18 }} />}
              variant="outlined"
              size="small"
              sx={{
                fontSize: "13px",
                borderRadius: "999px",
                padding: "4px 12px",
                textTransform: "none",
                minHeight: "30px",
              }}
            >
              Configurar Campos
            </Button>
          )}
        </Box>
      </Box>

      {records.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 10,
            gap: 2,
          }}
        >
          <Box sx={{ width: 300 }}>
            <Lottie animationData={emptyAnimation} loop autoplay />
          </Box>
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            No hay registros aún.
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: "linear-gradient(90deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "10px",
              padding: "10px 20px",
              textTransform: "none",
              "&:hover": { opacity: 0.9 },
            }}
            onClick={() => setOpenNewRecord(true)}
          >
            + Crear Primer Registro
          </Button>
        </Box>
      ) : (
        <Box>
          <Drawer
            anchor="right"
            open={showAdvancedFilters}
            onClose={() => setShowAdvancedFilters(false)}
            PaperProps={{
              sx: {
                width: 320,
                padding: 3,
                marginTop: { xs: "56px", sm: "64px" },
                height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
                overflowY: "auto",

                // 🎨 Estética Virtual Voices
                backgroundColor: "#fff",
                borderLeft: "2px solid #E5E7EB", // gris tipo Tailwind gray-200
                boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.06)", // sombra suave desde la derecha
              },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, px: 1, py: 0.5 }}>
                <TuneIcon sx={{ color: "#8B5CF6", mr: 1 }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    color: "#111827", // gris oscuro
                  }}
                >
                  Filtros
                </Typography>
                <Button
                  onClick={clearAllFilters}
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{
                    marginLeft: 3,
                    borderRadius: "999px",
                    fontSize: "12px",
                    padding: "4px 12px",
                    textTransform: "none",
                    fontWeight: "bold",
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    "&:hover": {
                      backgroundColor: "#fef2f2",
                      borderColor: "#ef4444",
                    },
                  }}
                >
                  Limpiar
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Box
                sx={{
                  backgroundColor: "#F9FAFB",
                  padding: 2,
                  borderRadius: 3,
                  mb: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#4B5563", mb: 1 }}>
                  📅 Filtrar por rango de fechas
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  {/* Campo a usar */}
                  <Select
                    fullWidth
                    size="small"
                    value={dateRangeField}
                    onChange={(e) => {
                      setDateRangeField(e.target.value as "createdAt" | "lastMessageTime");
                      setTempDateRange([null, null]);
                      setDateRange((prev) => {
                        const updated = { ...prev };
                        delete updated.createdAt;
                        delete updated.lastMessageTime;
                        return updated;
                      });
                    }}
                    sx={{
                      borderRadius: "999px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <MenuItem value="createdAt">Fecha de creación</MenuItem>
                    <MenuItem value="lastMessageTime">Hora del último mensaje</MenuItem>
                  </Select>

                  <DatePicker
                    label="Inicio"
                    value={tempDateRange[0]}
                    onChange={(date) => {
                      const [, end] = tempDateRange;
                      setTempDateRange([date, end]);
                      setDateRange((prev) => ({
                        ...prev,
                        [dateRangeField]: {
                          start: date ? date.toISOString() : "",
                          end: end ? end.toISOString() : "",
                        },
                      }));
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          backgroundColor: "#fff",
                          borderRadius: "999px",
                        },
                      },
                    }}
                  />

                  <DatePicker
                    label="Fin"
                    value={tempDateRange[1]}
                    onChange={(date) => {
                      const [start] = tempDateRange;
                      setTempDateRange([start, date]);
                      setDateRange((prev) => ({
                        ...prev,
                        [dateRangeField]: {
                          start: start ? start.toISOString() : "",
                          end: date ? date.toISOString() : "",
                        },
                      }));
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          backgroundColor: "#fff",
                          borderRadius: "999px",
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>

            <FilterPanel
              fields={fields}
              filters={filters}
              setFilters={setFilters}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Drawer>

          {hasFilters && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {/* Buscador activo */}
                {searchTerm && (
                  <Chip
                    label={`Buscar: "${searchTerm}"`}
                    onDelete={() => setSearchTerm("")}
                    color="primary"
                    variant="outlined"
                  />
                )}

                {/* Filtros dinámicos */}
                {Object.entries(filters).map(([key, val]) =>
                  val ? (
                    <Chip
                      key={key}
                      label={`${fields.find((f) => f.key === key)?.label || key}: ${val}`}
                      onDelete={() =>
                        setFilters((prev) => {
                          const updated = { ...prev };
                          delete updated[key];
                          return updated;
                        })
                      }
                      color="secondary"
                      variant="outlined"
                    />
                  ) : null
                )}

                {/* Rango de fechas */}
                {Object.entries(dateRange).map(([key, range]) => {
                  if (!range.start && !range.end) return null;

                  const fieldLabel =
                    key === "createdAt"
                      ? "📆 Fecha de creación"
                      : key === "lastMessageTime"
                      ? "⏰ Último mensaje"
                      : key;

                  const format = (iso: string) =>
                    new Date(iso).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });

                  return (
                    <Chip
                      key={key}
                      label={`${fieldLabel}: ${range.start ? format(range.start) : "..."} → ${
                        range.end ? format(range.end) : "..."
                      }`}
                      onDelete={() =>
                        setDateRange((prev) => {
                          const updated = { ...prev };
                          delete updated[key];
                          return updated;
                        })
                      }
                      color="info"
                      variant="outlined"
                    />
                  );
                })}

                {/* Botón para limpiar todo */}
                <Button
                  onClick={clearAllFilters}
                  variant="text"
                  size="small"
                  color="error"
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  🧹 Limpiar todo
                </Button>
              </Stack>
            </Box>
          )}

          <RecordTable
            records={filteredRecords}
            fields={fields}
            fetchRecords={fetchRecords}
            onEdit={openEditRecordModal}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onOpenDrawer={handleOpenDrawer} // Pasar la función al RecordTable
          />
        </Box>
      )}

      {/* 🔥 Modal de nuevo registro */}
      <NewRecordModal
        open={openNewRecord}
        onClose={() => setOpenNewRecord(false)}
        slug={slug!}
        fields={fields}
        onSuccess={fetchRecords}
      />
      <RecordEditModal
        open={openEditModal}
        record={editingRecord}
        editingFields={editingFields}
        setEditingFields={setEditingFields}
        onClose={() => setOpenEditModal(false)}
        onSave={saveEditedRecord}
      />

      <RecordSettings
        open={openSettings}
        slug={slug!}
        fields={fields}
        setFields={setFields}
        fetchFields={fetchRecords}
        onClose={() => setOpenSettings(false)}
      />

      <ProspectDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        record={selectedRecord}
        editingFields={editingFields}
        setEditingFields={setEditingFields}
        onSave={saveEditedRecord}
      />
    </Box>
  );
}

export default TablePage;
