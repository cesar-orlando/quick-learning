import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Box, Card, Typography, Snackbar, Alert, Drawer, IconButton, TextField, Switch, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { DataGrid } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import { customerService } from "services/customer";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import withAuth from "middleware/withJWT";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { io } from "socket.io-client";

// Conexión global
const socket = io(process.env.REACT_APP_API_URL); // ⚠️ Asegúrate que sea el mismo dominio del backend


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
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0]);
  

  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        setSnackbarMessage("La fecha final no puede ser menor a la inicial");
        setSnackbarSeverity("warning");
        setOpenSnackbar(true);
        return;
      }
      getData(0, 500, startDate, endDate);
    }
  }, [startDate, endDate]);


  useLayoutEffect(() => {
    if (openDrawer && selectedCustomer?.messages?.length) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 150); // <-- tiempo suficiente para que renderice
    }
  }, [openDrawer, selectedCustomer]);



  useEffect(() => {
    if (!searchTerm && !startDate && !endDate) {
      // No hay filtros: usar los datos paginados normales
      getData();
    } else {
      // Aplicar búsqueda sobre todos (💡 puedes crear una ruta en el backend con filtros + paginación)
      // Por ahora solo filtras local si ya los tienes
      const filteredResults = customers.filter((customer) => {
        const matchesSearch =
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.messages.some((message) =>
            message.body.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const lastMessage = customer.messages?.[customer.messages.length - 1];
        if (!startDate || !endDate) return matchesSearch;
        if (!lastMessage) return false;

        const msgDate = new Date(lastMessage.dateCreated);
        return matchesSearch && msgDate >= new Date(startDate) && msgDate <= new Date(endDate);
      });

      setCustomers(filteredResults); // ⚠️ aquí ya no usamos `filteredCustomers`
    }
  }, [searchTerm, startDate, endDate]);

  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedCustomer?.messages]);


  const getData = async (pageToLoad = 0, size = 500, startDate, endDate) => {
    try {
      const { data, total, success } = await customerService.getCustomers(
        pageToLoad + 1,
        size,
        startDate,
        endDate
      );
      if (!success) throw new Error("Error al cargar los datos");

      console.log("data --->", data);
  
      setCustomers(data);
      setFilteredCustomers(data);
      setSnackbarMessage("Datos cargados correctamente");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Error al cargar los datos");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
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

  const sendTemplateMessage = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v2/whastapp/send-message-quick-learning`, {
        phone: selectedCustomer.phone,
        name: selectedCustomer.name,
      });
      setSnackbarMessage("Mensaje de plantilla enviado correctamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error al enviar el mensaje de plantilla:", error);
      setSnackbarMessage("Error al enviar el mensaje de plantilla");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const shouldShowTemplateButton = () => {
    if (!selectedCustomer || !selectedCustomer.messages.length) return true;

    // Filtrar los mensajes entrantes del cliente
    const inboundMessages = selectedCustomer.messages.filter(message => message.direction === "inbound");
    if (!inboundMessages.length) return true;

    const lastInboundMessage = inboundMessages[inboundMessages.length - 1];
    const lastMessageDate = new Date(lastInboundMessage.dateCreated);
    const now = new Date();
    const hoursDifference = Math.abs(now - lastMessageDate) / 36e5;

    return hoursDifference > 24;
  };

  const updateCustomerIAStatus = async (customerId, iaStatus) => {
    setLoading(true);
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return setLoading(false);

    const data = {
      phone: customer.phone,
      comments: customer.comments || "",
      classification: customer.classification,
      visitDetails: customer.visitDetails || { branch: "", date: null, time: "" },
      enrollmentDetails: customer.enrollmentDetails || {
        consecutive: null,
        course: "",
        modality: "",
        state: "",
        email: "",
        source: "",
        paymentType: ""
      },
      user: customer.user,
      ia: iaStatus,
      date: new Date().toISOString()
    };

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/updatecustomer`, data, {
        headers: {
          id: customerId,
          'Content-Type': 'application/json'
        }
      });
      setSnackbarMessage("Estado de IA actualizado correctamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      getData(); // Actualizar los datos después de la actualización
    } catch (error) {
      console.error("Error al actualizar el estado de IA:", error);
      setSnackbarMessage("Error al actualizar el estado de IA");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
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
    {
      field: "ia",
      headerName: "IA",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Switch
          checked={params.row.ia}
          onClick={(e) => e.stopPropagation()} // Detener la propagación del evento de clic
          onChange={(e) => {
            updateCustomerIAStatus(params.row.id, e.target.checked);
          }}
        />
      )
    }
  ];

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const exportToExcel = () => {
    if (filteredCustomers.length === 0) {
      setSnackbarMessage("No hay datos para exportar");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      return;
    }

    const dataToExport = filteredCustomers.map((customer) => ({
      Cliente: customer.name,
      Teléfono: customer.phone,
      Estado: customer.status,
      Clasificación: customer.classification,
      Usuario: customer.userName,
      "Fecha del Último Mensaje":
        customer.messages.length > 0
          ? formatDate(customer.messages[customer.messages.length - 1].dateCreated)
          : "Sin mensajes",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Clientes_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  useEffect(() => {
    socket.on("new_message", (data) => {
      console.log("💬 Mensaje nuevo recibido por socket:", data);

      setCustomers((prevCustomers) => {
        const updatedCustomers = [...prevCustomers];
        const existing = updatedCustomers.find(c => c.phone === data.phone);

        if (existing) {
          existing.messages.push({
            direction: data.direction,
            body: data.body,
            dateCreated: data.timestamp,
          });

          // Reordenar lista por último mensaje si quieres (opcional)
          updatedCustomers.sort((a, b) => {
            const dateA = new Date(a.messages[a.messages.length - 1]?.dateCreated || 0);
            const dateB = new Date(b.messages[b.messages.length - 1]?.dateCreated || 0);
            return dateB - dateA;
          });

          return [...updatedCustomers];
        } else {
          // 🆕 Cliente nuevo que no existía aún (puedes volver a llamar getData o crearlo vacío con el mensaje)
          console.log("🆕 Cliente nuevo, volviendo a cargar lista...");
          getData(); // ⚠️ Esto hace una petición completa pero solo si no existe
          return prevCustomers;
        }
      });

      // También actualizar el chat abierto si coincide
      setSelectedCustomer((prev) => {
        if (!prev || prev.phone !== data.phone) return prev;

        const alreadyExists = prev.messages.some(
          m => m.body === data.body && m.direction === data.direction && new Date(m.dateCreated).toISOString() === new Date(data.timestamp).toISOString()
        );

        if (alreadyExists) return prev;

        return {
          ...prev,
          messages: [...prev.messages, {
            direction: data.direction,
            body: data.body,
            dateCreated: data.timestamp,
          }],
        };
      });
    });

    return () => {
      socket.off("new_message");
    };
  }, []);

  //https://www.jetdan9878.online/api/v2/whastapp/message

  return (
    <DashboardLayout>
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <Card sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Clientes
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
            <TextField
              label="Buscar"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: "300px" }} // Ajustar ancho del buscador
            />
            <TextField
              label="Fecha Inicial"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ width: "200px" }}
            />
            <TextField
              label="Fecha Final"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: "200px" }}
            />
            {/* Botón para exportar */}
            <Button
              variant="contained"
              color="success"
              onClick={exportToExcel}
              startIcon={<DownloadIcon />}
              sx={{ height: 40 }}
            ></Button>
          </Box>

          <Box sx={{ height: "88vh", width: "100%" }}>
            <DataGrid
              rows={customers}
              columns={columns}
              loading={loading}
              onRowClick={handleRowClick}
              disableColumnMenu
              disableSelectionOnClick
              rowHeight={38}
              sx={{
                width: "100%",
                "& .MuiDataGrid-root": { borderRadius: "10px" },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: "bold" },
                fontSize: "0.8rem",
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
                        maxWidth: "75%",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        display: "inline-block",
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
                {shouldShowTemplateButton() ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={sendTemplateMessage}
                    disabled={loading}
                    sx={{ width: "100%", color: "primary" }} // Estilo para abarcar todo el espacio y texto blanco
                  >
                    <Typography variant="body3" color={"#FFFFFF"} >📝 Plantilla para retomar conversación</Typography>
                  </Button>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <IconButton color="primary" onClick={sendMessage} disabled={loading}>
                      <SendIcon />
                    </IconButton>
                  </>
                )}
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

export default withAuth(Customers);
