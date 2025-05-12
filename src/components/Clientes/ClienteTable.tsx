import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  // Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import { formatCurrency } from "../../utils/formatCurrency";
import { Cliente } from "./types";
import { useState } from "react";

interface Props {
  clientes: Cliente[];
  visibleFields: any[];
  searchTerm: string;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string, name: string) => void;
}

const ClienteTable = ({
  clientes,
  visibleFields,
  searchTerm,
  onEdit,
  onDelete,
}: Props) => {
  const [modalFiles, setModalFiles] = useState<string[]>([]);

  // Cuando hacen click en la caja de archivos
  const handleOpenFilesModal = (files: string[]) => {
    setModalFiles(files);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Teléfono</TableCell>
          {visibleFields.map(
            (field) =>
              field.visible !== false && (
                <TableCell key={field.key}>{field.label}</TableCell>
              )
          )}
          <TableCell>Acciones</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {clientes
          .filter((cliente) => {
            const lower = searchTerm.toLowerCase();
            return (
              cliente.name.toLowerCase().includes(lower) ||
              cliente.phone.toLowerCase().includes(lower) ||
              cliente.customFields?.some((field) =>
                field.value?.toLowerCase().includes(lower)
              )
            );
          })
          .map((cliente) => (
            <TableRow key={cliente._id}>
              <TableCell>{cliente.name}</TableCell>
              <TableCell>{cliente.phone}</TableCell>
              {visibleFields.map((field) => {
                const fieldData = cliente.customFields?.find(
                  (f) => f.key === field.key
                );
                const value = fieldData?.value ?? "-";

                if (field.type === "file" && value && Array.isArray(value)) {
                  return (
                    <TableCell key={field.key}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
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
                const isCurrency = field.key === "budget"; // 👈 aquí puedes agregar más keys si necesitas

                return (
                  <TableCell key={field.key}>
                    {isCurrency ? formatCurrency(value) : value}
                  </TableCell>
                );
              })}

              <TableCell>
                <IconButton onClick={() => onEdit(cliente)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(cliente._id, cliente.name)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
      <Dialog
        open={modalFiles.length > 0}
        onClose={() => setModalFiles([])}
        fullWidth
        maxWidth="md"
      >
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
                      <img
                        src="/icons/pdf-icon.png"
                        alt="PDF"
                        style={{ width: 45, height: 45, marginBottom: 4 }}
                      />
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
  );
};

export default ClienteTable;
