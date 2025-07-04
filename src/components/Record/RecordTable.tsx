import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Button,
  Badge,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DownloadIcon from "@mui/icons-material/Download";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import { useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/formatCurrency";
import ActionMenu from "../ui/ActionMenu";
import LoaderBackdrop from "../ui/LoaderBackdrop";
import { exportRecordsToExcel } from "../../utils/exportRecordsToExcel";

interface Field {
  key: string;
  label: string;
  type: string;
  visible?: boolean;
  format: string;
}

interface RecordTableProps {
  records: any[];
  fields: Field[];
  fetchRecords: () => Promise<void>;
  onEdit: (record: any) => void;
  sortField: string;
  setSortField: (v: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: "asc" | "desc") => void;
  onOpenDrawer: (record: any) => void;
  newMessageRecords?: { recordId: string; timestamp: number }[];
}

export const RecordTable = ({
  records,
  fields,
  fetchRecords,
  onEdit,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onOpenDrawer,
  newMessageRecords = [],
}: RecordTableProps) => {
  const [modalFiles, setModalFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleOpenFilesModal = (files: string[]) => {
    setModalFiles(files);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;

    try {
      setLoading(true);
      await api.delete(`/records/delete/${id}`);
      await fetchRecords();
    } catch (error) {
      console.error("Error al eliminar registro:", error);
    } finally {
      setLoading(false);
    }
  };
  const totalRecords = records.length;

  return (
    <>
      <LoaderBackdrop open={loading} text="Guardando cambios..." />
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} px={1}>
        <Button
          onClick={() => {
            const recordsWithFecha = records.map((record) => ({
              ...record,
              fechaDeLlegada: record.createdAt
                ? new Date(
                    typeof record.createdAt === "string"
                      ? record.createdAt
                      : record.createdAt.$date
                  ).toLocaleString("es-MX", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-",
            }));

            // Agrega el campo a fields solo para la exportación
            const fieldsWithFecha = [
              ...fields,
              {
                key: "fechaDeLlegada",
                label: "Fecha de llegada",
                type: "date",
                format: "default",
                visible: true,
              },
            ];

            exportRecordsToExcel(recordsWithFecha, fieldsWithFecha, "tabla-prospectos.xlsx");
          }}
          sx={{
            minWidth: "auto",
            padding: "6px",
            borderRadius: "12px",
            backgroundColor: "#22C55E", // Verde bonito
            color: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            "&:hover": {
              backgroundColor: "#16A34A", // Verde más oscuro al pasar el mouse
            },
          }}
        >
          <DownloadIcon sx={{ fontSize: 20 }} />
        </Button>
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} px={1}>
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1E293B" }}>
          Total: {totalRecords}
        </Typography>
      </Box>
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
              <TableCell sx={{ width: 40, backgroundColor: "#F9FAFB" }}></TableCell>
              {fields.map(
                (field) =>
                  field.visible !== false && (
                    <TableCell
                      key={field.key}
                      onClick={() => {
                        if (field.type !== "number" && field.type !== "date") return;
                        if (sortField !== field.key) {
                          setSortField(field.key);
                          setSortOrder("asc");
                        } else {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }
                      }}
                      sx={{
                        fontWeight: "bold",
                        cursor: field.type === "number" || field.type === "date" ? "pointer" : "default",
                        userSelect: "none",
                        backgroundColor: sortField === field.key ? "#F0F4FF" : "inherit",
                        transition: "background-color 0.3s ease",
                      }}
                      title={
                        field.type === "number" || field.type === "date"
                          ? "Haz clic para ordenar este campo"
                          : undefined
                      }
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          "&:hover .sort-icon": {
                            opacity: 1,
                          },
                        }}
                      >
                        {field.label}

                        {(field.type === "number" || field.type === "date") && (
                          <Box
                            className="sort-icon"
                            sx={{
                              transition: "all 0.3s ease",
                              fontSize: "14px",
                              color: sortField === field.key ? "#3B82F6" : "#BBB",
                              opacity: sortField === field.key ? 1 : 0.6,
                              transform:
                                sortField === field.key
                                  ? sortOrder === "asc"
                                    ? "rotate(0deg)"
                                    : "rotate(180deg)"
                                  : "rotate(0deg)",
                            }}
                          >
                            {sortField === field.key ? "▲" : "△"}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  )
              )}
              <TableCell sx={{ fontWeight: "bold" }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {records.map((record) => {
              // Buscar si este registro tiene mensaje nuevo
              const msgObj = newMessageRecords.find((r) => r.recordId === record._id);
              const showBadge = !!msgObj;
              // La animación siempre está activa si hay mensaje nuevo
              const animate = showBadge;
              return (
                <TableRow
                  key={record._id}
                  sx={{
                    borderBottom: "1px solid #E5E7EB",
                    transition: "background 0.2s",
                    "&:hover": {
                      backgroundColor: "#FAFAFA",
                    },
                  }}
                >
                  <TableCell align="center" sx={{ width: 40 }}>
                    {showBadge && (
                      <Badge
                        color="error"
                        variant="dot"
                        overlap="circular"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        sx={{
                          ".MuiBadge-dot": {
                            width: 10,
                            height: 10,
                            minWidth: 0,
                            minHeight: 0,
                            border: "2px solid #fff",
                          },
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            animation: animate ? "shake-bell 0.7s infinite" : undefined,
                          }}
                        >
                          <NotificationsNoneIcon sx={{ color: "#FF5BAE" }} />
                        </span>
                      </Badge>
                    )}
                  </TableCell>
                  {fields.map((field) => {
                    let value;
                    // Si el campo existe directo en el objeto, úsalo
                    if (record.hasOwnProperty(field.key)) {
                      value = record[field.key];
                    } else {
                      // Si no, busca en customFields
                      const fieldData = record.customFields?.find((f: any) => f.key === field.key);
                      value = fieldData ? fieldData.value : "";
                    }

                    if (field.key === "fechaDeLlegada") {
                      return (
                        <TableCell align="left">
                          {record.createdAt
                            ? new Date(
                                typeof record.createdAt === "string" ? record.createdAt : record.createdAt.$date // Por si viene como objeto
                              ).toLocaleString("es-MX", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </TableCell>
                      );
                    }

                    if (field.key === "asesor" && value) {
                      // Parsear el valor si está en formato JSON
                      let parsedValue = value;
                      if (typeof value === "string") {
                        try {
                          parsedValue = JSON.parse(value);
                        } catch (err) {
                          console.warn("❌ Error al hacer JSON.parse en el campo asesor:", value);
                          parsedValue = { name: value }; // fallback
                        }
                      }

                      const name = parsedValue?.name || "-";
                      const truncatedName = name.split(" ").slice(0, 2).join(" "); // Obtener las dos primeras palabras

                      return (
                        <TableCell
                          key={field.key}
                          align="left"
                          sx={{ maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          <Tooltip title={name} placement="top-start" arrow>
                            <Box
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {truncatedName}
                            </Box>
                          </Tooltip>
                        </TableCell>
                      );
                    }

                    if (field.key === "lastMessageTime" && value) {
                      return (
                        <TableCell
                          key={field.key}
                          align="left"
                          sx={{ maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          <Box
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {new Date(value).toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Box>
                        </TableCell>
                      );
                    }

                    if (field.type === "file" && value && Array.isArray(value)) {
                      return (
                        <TableCell
                          key={field.key}
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "center",
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            justifyContent="center"
                            onClick={() => handleOpenFilesModal(value)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Typography variant="body2">
                              📂 {value.length} archivo{value.length > 1 ? "s" : ""}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    }

                    const isCurrency = field.type == "number" && field.format == "currency";

                    return (
                      <TableCell
                        key={field.key}
                        align={field.type === "number" ? "right" : "left"}
                        sx={{ maxWidth: 250, position: "relative", "&:hover .open-button": { opacity: 1 } }}
                      >
                        <Tooltip title={value} placement="top-start" arrow>
                          <Box
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {isCurrency
                              ? formatCurrency(value)
                              : `${
                                  value.toString() == "true" ? "Activo" : value.toString() == "false" ? "Inactivo" : value
                                }`}
                          </Box>
                        </Tooltip>
                        {["prospectos", "clientes", "alumnos", "sin-contestar"].includes(record.tableSlug) && (
                          <Button
                            className="open-button"
                            onClick={() => onOpenDrawer(record)}
                            startIcon={<KeyboardArrowRightIcon sx={{ width: 12, height: 12 }} />}
                            sx={{
                              height: 18,
                              fontSize: "10px",
                              textTransform: "none",
                              position: "absolute",
                              bottom: 4,
                              right: 4,
                              opacity: 0,
                              transition: "opacity 0.2s ease-in-out",
                              backgroundColor: "#F3F4F6",
                              color: "#374151",
                              padding: "0 4px",
                              gap: "1px",
                              minWidth: "auto",
                              "&:hover": {
                                opacity: 1,
                                backgroundColor: "#E5E7EB",
                              },
                            }}
                          >
                            Abrir
                          </Button>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedRecord(record); // ✅ Este es el truco: guarda el record correcto
                      }}
                    >
                      <MoreVertIcon sx={{ color: "#6B7280" }} />
                    </IconButton>
                    <ActionMenu
                      anchorEl={menuAnchor}
                      onClose={() => setMenuAnchor(null)}
                      onEdit={() => {
                        if (selectedRecord) {
                          onEdit(selectedRecord); // ✅ aquí sí es correcto
                          setMenuAnchor(null);
                        }
                      }}
                      onDelete={() => {
                        if (selectedRecord) {
                          handleDeleteRecord(selectedRecord._id);
                          setMenuAnchor(null);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <Dialog open={modalFiles.length > 0} onClose={() => setModalFiles([])} fullWidth maxWidth="md">
            <DialogTitle>Archivos</DialogTitle>
            <DialogContent>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {modalFiles.map((fileUrl, idx) => {
                  const isImage = fileUrl.match(/\.(jpg|jpeg|png|webp)$/i);
                  const isPdf = fileUrl.match(/\.pdf$/i);
                  const isWord = fileUrl.match(/\.(doc|docx)$/i);
                  const isExcel = fileUrl.match(/\.(xls|xlsx)$/i);
                  const isPowerPoint = fileUrl.match(/\.(ppt|pptx)$/i);

                  return (
                    <Box
                      key={idx}
                      onClick={() => window.open(fileUrl, "_blank")}
                      sx={{
                        width: 100,
                        height: 100,
                        border: "1px solid #ccc",
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "#f5f5f5",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 1,
                        cursor: "pointer",
                      }}
                    >
                      {isImage ? (
                        <img
                          src={fileUrl}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : isPdf ? (
                        <>
                          <img src="/icons/pdf-icon.png" alt="PDF" style={{ width: 45, height: 45, marginBottom: 4 }} />
                          <Typography variant="caption" sx={{ fontSize: "11px" }}>
                            PDF
                          </Typography>
                        </>
                      ) : isWord ? (
                        <>
                          <img
                            src="/icons/word-icon.png"
                            alt="Word"
                            style={{ width: 45, height: 45, marginBottom: 4 }}
                          />
                          <Typography variant="caption" sx={{ fontSize: "11px" }}>
                            Word
                          </Typography>
                        </>
                      ) : isExcel ? (
                        <>
                          <img
                            src="/icons/excel-icon.png"
                            alt="Excel"
                            style={{ width: 45, height: 45, marginBottom: 4 }}
                          />
                          <Typography variant="caption" sx={{ fontSize: "11px" }}>
                            Excel
                          </Typography>
                        </>
                      ) : isPowerPoint ? (
                        <>
                          <img
                            src="/icons/ppt-icon.png"
                            alt="PowerPoint"
                            style={{ width: 45, height: 45, marginBottom: 4 }}
                          />
                          <Typography variant="caption" sx={{ fontSize: "11px" }}>
                            PowerPoint
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ fontSize: "11px" }}>
                          Archivo
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
          </Dialog>
        </Table>
      </Box>
    </>
  );
};

export default RecordTable;

// Animación CSS para la campana vibrando
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake-bell {
  0% { transform: rotate(0deg); }
  15% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  45% { transform: rotate(-10deg); }
  60% { transform: rotate(6deg); }
  75% { transform: rotate(-4deg); }
  100% { transform: rotate(0deg); }
}`;
if (!document.head.querySelector('#bell-shake-style')) {
  style.id = 'bell-shake-style';
  document.head.appendChild(style);
}
