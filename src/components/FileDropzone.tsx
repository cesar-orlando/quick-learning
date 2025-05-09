import { useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadFileToS3 } from "../utils/uploadFileToS3";
import { isValidFileType } from "../utils/validateFileType";

interface Props {
  value: string[];   // 🔥 nuevo
  onChange: (urls: string[]) => void;  // 🔥 nuevo
}

interface UploadingFile {
  file: File;
  previewUrl: string;
  isUploading: boolean;
}

const FileDropzone = ({ value, onChange }: Props) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleFiles = async (acceptedFiles: File[]) => {
    const invalidFiles = acceptedFiles.filter((file) => !isValidFileType(file));
    const validFiles = acceptedFiles.filter((file) => isValidFileType(file));
  
    if (invalidFiles.length > 0) {
      const message = `❌ Estos archivos no están permitidos:\n${invalidFiles.map((f) => f.name).join("\n")}`;
      setSnackbarMessage(message);
      setOpenSnackbar(true);
    }
  
    if (validFiles.length === 0) return;
  
    const newUploading = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));
  
    setUploadingFiles((prev) => [...prev, ...newUploading]);
  
    let updatedUrls = [...value]; // 🔥 Clonamos value actual para ir acumulando aquí
  
    for (const fileObj of newUploading) {
      const url = await uploadFileToS3(fileObj.file);
  
      if (url) {
        updatedUrls.push(url); // 🔥 Agregamos el nuevo URL al arreglo
      }
  
      setUploadingFiles((prev) => prev.filter((f) => f.file !== fileObj.file));
      onChange([...updatedUrls]); // 🔥 Cada vez actualizamos el cambio
    }
  };
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "application/pdf": [],
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-powerpoint": [],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [],
    },
    onDrop: handleFiles,
    onDropRejected: (fileRejections) => {
      const rejectedNames = fileRejections.map((rejection) => rejection.file.name);
      const message = `❌ No se permiten estos archivos:\n${rejectedNames.join(", ")}`;
      setSnackbarMessage(message);
      setOpenSnackbar(true);
    },
  });

  const handleRemove = (fileUrl: string) => {
    const updated = value.filter((url) => url !== fileUrl);
    onChange(updated);
  };

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #ccc",
          padding: 2,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: isDragActive ? "#f0f0f0" : "background.paper",
          cursor: "pointer",
          mb: 2,
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body2">
          {isDragActive ? "Suelta los archivos aquí..." : "Arrastra archivos o haz clic para subir"}
        </Typography>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2}>
        {value.map((fileUrl, idx) => {
          const isImage = fileUrl.match(/\.(jpg|jpeg|png|webp)$/i);
          const isPdf = fileUrl.match(/\.pdf$/i);
          const isWord = fileUrl.match(/\.(doc|docx)$/i);
          const isExcel = fileUrl.match(/\.(xls|xlsx)$/i);
          const isPowerPoint = fileUrl.match(/\.(ppt|pptx)$/i);

          return (
            <Box
              key={idx}
              sx={{
                width: 100,
                height: 100,
                position: "relative",
                border: "1px solid #ccc",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#f5f5f5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 1,
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => window.open(fileUrl, "_blank")}
            >
              {isImage ? (
                <img
                  src={fileUrl}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : isPdf ? (
                <img src="/icons/pdf-icon.png" alt="PDF" style={{ width: 45, height: 45 }} />
              ) : isWord ? (
                <img src="/icons/word-icon.png" alt="Word" style={{ width: 45, height: 45 }} />
              ) : isExcel ? (
                <img src="/icons/excel-icon.png" alt="Excel" style={{ width: 45, height: 45 }} />
              ) : isPowerPoint ? (
                <img src="/icons/ppt-icon.png" alt="PowerPoint" style={{ width: 45, height: 45 }} />
              ) : (
                <Typography variant="caption">Archivo</Typography>
              )}

              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(fileUrl);
                }}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  boxShadow: 1,
                  width: 22,
                  height: 22,
                  p: 0,
                  zIndex: 10,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}

        {/* Subiendo archivos */}
        {uploadingFiles.map((idx) => (
          <Box
            key={`uploading-${idx}`}
            sx={{
              width: 100,
              height: 100,
              border: "1px dashed #ccc",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f9f9f9",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ))}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          onClose={() => setOpenSnackbar(false)}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileDropzone;
