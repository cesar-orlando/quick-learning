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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/formatCurrency";
import ActionMenu from "../ui/ActionMenu";
import LoaderBackdrop from "../ui/LoaderBackdrop";

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

  return (
    <>
      <LoaderBackdrop open={loading} text="Guardando cambios..." />
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
            {records.map((record) => (
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
                {fields.map((field) => {
                  const fieldData = record.customFields?.find((f: any) => f.key === field.key);
                  const value = fieldData?.value ?? "-";

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
                      sx={{ maxWidth: 250 }}
                    >
                      <Tooltip title={value} placement="top-start" arrow>
                        <Box
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {isCurrency ? formatCurrency(value) : value}
                        </Box>
                      </Tooltip>
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
            ))}
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
