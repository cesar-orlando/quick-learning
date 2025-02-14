import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Stack,
  CircularProgress,
  circularProgressClasses,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "components/Loading/Loading";
import ActionButton from "components/ActionButton/ActionButton";

function CustomerChat() {
  const { id } = useParams(); // Obtiene el parámetro `id` de la URL
  const [messages, setMessages] = useState([]);
  const [customer, setCustomer] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ia, setIa] = useState(true); // Estado para manejar el valor de `ia`
  const [comments, setComments] = useState("");
    const navigate = useNavigate();
  

  const handleGetInfoCustomer = async () => {
    setLoading(true);
    await axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/details/${id}`)
      .then((response) => {
        setCustomer(response.data.customer);
        setIa(response.data.customer.ia);
        setComments(response.data.customer.comments);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const handleGetChat = async () => {

    if (!customer.phone) {
      return;
    }

    await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/chat/messages/${customer.phone}`)
      .then((response) => {
        setMessages(response.data.messages);
        setLoading(false);
      }).catch((error) => {
        console.log("error", error.data);
        console.log("entra aqui errorData");
        let data = JSON.stringify({
          "to": `whatsapp:+${customer.phone}`
        });
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.REACT_APP_API_URL}/api/v2/whastapp/logs-messages`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: data
        };
        axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            setMessages(response.data.findMessages);
          })
          .catch((error) => {
            console.log(error);
          }).finally(() => {
            setLoading(false);
          });
      });
  };

  const handleToggleIA = async () => {
    const newIaValue = !ia;
    let data = JSON.stringify({ ia: newIaValue });

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.REACT_APP_API_URL}/api/v1/quicklearning/update/${id}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        setIa(newIaValue); // Actualizar el estado `ia`
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Handle sending messages
  const sendMessage = () => {
    setLoading(true);
    axios.post(`${process.env.REACT_APP_API_URL}/api/v2/whastapp`, {
      to: `whatsapp:+${customer.phone}`,
      message: input,
    }).then((response) => {
      console.log(response);
      axios.get(`${process.env.REACT_APP_API_URL}/api/v1/chat/sync-chat/${customer.phone}`).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    }).finally(() => {
      setInput("");
      handleGetChat();
    });
  };

  const handleSynchat = () => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/api/v1/chat/sync-chat/${customer.phone}`).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    }).finally(() => {
      handleGetChat();
    });
  };

  useEffect(() => {
    handleGetInfoCustomer();
  }, []);

  useEffect(() => {
    handleGetChat();
  }, [customer]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semitransparente
            zIndex: 10, // Asegurarse de que esté por encima del contenido
          }}
        >
          <Loading /> {/* Usar el componente de carga aquí */}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "16px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              height: "600px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9",
            }}
          >

            {/* Title */}
            <Typography variant="h6" align="center" gutterBottom>
              Chat with {customer.name} ({customer.phone})
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
              <ActionButton data={ia ? "Desactivar IA" : "Activar IA"} onClick={handleToggleIA} icon="IA" />
              <ActionButton data="Editar" onClick={() => navigate(`/customer/${customer._id}`)}  />
              <ActionButton data="Sync" onClick={handleSynchat}  />
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "16px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <List>
                {messages.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      justifyContent: msg.direction === "outbound-api" ? "flex-end" : "flex-start",
                    }}
                  >
                    <ListItemText
                      sx={{
                        maxWidth: "60%",
                        textAlign: msg.direction === "outbound-api" ? "right" : "left",
                        backgroundColor: msg.direction === "outbound-api" ? "#d1e7ff" : "#f1f0f0",
                        borderRadius: "8px",
                        padding: "8px",
                        margin: "8px 0",
                      }}
                      primary={<Typography variant="body2"> {/* Cambia el tamaño del texto aquí */}
                        {msg.body}
                      </Typography>}
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          {new Date(msg.dateCreated).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
                        </Typography>
                      }

                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <Button variant="contained" color="primary" onClick={sendMessage} disabled={!input} >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
}

export default CustomerChat;
