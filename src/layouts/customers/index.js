import { useState, useEffect, useRef } from "react";
import { Box, Card, Typography, Snackbar, Alert, Drawer, IconButton, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import { customerService } from "services/customer";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (openDrawer && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [openDrawer, selectedCustomer]);

  useEffect(() => {
    const results = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredCustomers(results);
  }, [searchTerm, customers]);

  const getData = async () => {
    try {
      const { data, success } = await customerService.getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
      setLoading(false);
      setSnackbarMessage(success ? "Datos cargados correctamente" : "Error al cargar los datos");
      setSnackbarSeverity(success ? "success" : "error");
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Error al cargar los datos");
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
    }
  };

  const handleRowClick = (params) => {
    setSelectedCustomer(params.row);
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    console.log("selectedCustomer.phone", selectedCustomer.phone);


    axios.post(`${process.env.REACT_APP_API_URL}/api/v2/whastapp`, {
      to: `${selectedCustomer.phone}`,
      message: newMessage,
    }).then((response) => {
      console.log("Mensaje enviado:", response);
      setSnackbarMessage("Mensaje enviado correctamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Actualizar la conversación del cliente seleccionado
      const updatedCustomer = { ...selectedCustomer };
      updatedCustomer.messages.push({
        _id: new Date().getTime(), // Generar un ID temporal para el nuevo mensaje
        body: newMessage,
        direction: "outbound",
        dateCreated: new Date().toISOString(),
      });
      setSelectedCustomer(updatedCustomer);
    }).catch((error) => {
      console.error("Error al enviar el mensaje:", error);
      setSnackbarMessage("Error al enviar el mensaje");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }).finally(() => {
      setLoading(false);
      setNewMessage("");
      getData();
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Mexico_City",
    });
  };

  const columns = [
    { field: "name", headerName: "Cliente", flex: 1, minWidth: 250 },
    { field: "phone", headerName: "Teléfono", flex: 1, minWidth: 150 },
    { field: "status", headerName: "Estado", flex: 1, minWidth: 150 },
    { field: "classification", headerName: "Clasificación", flex: 1, minWidth: 150 },
    { field: "userName", headerName: "Usuario", flex: 1, minWidth: 150 },
    { field: "lastMessage", headerName: "Último mensaje", flex: 1, minWidth: 150 },
  ];

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <Card sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Clientes
          </Typography>
          <TextField
            label="Buscar"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ height: "88vh", width: "100%" }}>
            <DataGrid
              rows={filteredCustomers}
              columns={columns}
              pageSize={50} // Aumentar el número de filas por página
              autoPageSize
              disableColumnMenu
              disableSelectionOnClick
              loading={loading}
              onRowClick={handleRowClick}
              rowHeight={38} // Reducir la altura de las filas
              sx={{
                width: "100%",
                "& .MuiDataGrid-root": { borderRadius: "10px" },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: "bold" },
                fontSize: "0.8rem", // Reducir el tamaño de la fuente
                fontWeight: "bold",
              }}
            />
          </Box>
        </Card>

        {/* Panel lateral para chat */}
        <Drawer
          anchor="right"
          open={openDrawer}
          onClose={handleCloseDrawer}
          sx={{
            width: "100vw",
            "& .MuiDrawer-paper": {
              width: "70vw",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            {/* 📌 Sección de información del usuario */}
            <Box sx={{ width: "40%", p: 2, borderRight: "1px solid #ddd", overflowY: "auto" }}>
              <IconButton onClick={handleCloseDrawer} sx={{ float: "right" }}>
                <CloseIcon />
              </IconButton>
              {selectedCustomer && (
                <>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedCustomer.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedCustomer.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Estado: <strong>{selectedCustomer.status}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Clasificación: <strong>{selectedCustomer.classification}</strong>
                  </Typography>
                </>
              )}
            </Box>

            {/* 📌 Sección del Chat */}
            <Box sx={{ width: "60%", p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
              {/* 📌 Lista de mensajes */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  p: 2,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {selectedCustomer?.messages.map((message) => (
                  <Box
                    key={message._id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: message.direction === "inbound" ? "flex-start" : "flex-end",
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        backgroundColor: message.direction === "inbound" ? "#e5e5ea" : "#2E96FC",
                        color: message.direction === "inbound" ? "black" : "white",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        maxWidth: "75%", // 🔹 No ocupa todo el ancho
                        wordBreak: "break-word", // 🔹 Ajusta palabras largas
                        whiteSpace: "pre-wrap", // 🔹 Hace saltos de línea cuando es necesario
                        display: "inline-block", // 🔹 Ajusta el tamaño al contenido
                        fontSize: "0.9rem",
                      }}
                    >

                      {message.direction === "inbound" ? "👤" : "🤖"} {message.body}
                      <br />
                      <strong>{formatDate(message.dateCreated)}</strong>
                    </Typography>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* 📌 Input de mensaje */}
              <Box sx={{ display: "flex", mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <IconButton color="primary" onClick={sendMessage} disabled={loading} >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Drawer>
      </Box>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Customers;
