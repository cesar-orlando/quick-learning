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
import { useParams } from "react-router-dom";

function CustomerChat() {
  const { id } = useParams(); // Obtiene el parámetro `id` de la URL
  const [messages, setMessages] = useState([]);
  const [customer, setCustomer] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ia, setIa] = useState(true); // Estado para manejar el valor de `ia`

  const handleGetInfoCustomer = async () => {
    setLoading(true);
    await axios
      .get(`https://www.jetdan9878.online/api/v1/quicklearning/details/${id}`)
      .then((response) => {
        setCustomer(response.data.customer);
        setIa(response.data.customer.ia); 
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const handleGetChat = async () => {
    await axios
      .post("https://www.jetdan9878.online/api/v2/whastapp/logs-messages", {
        to: `whatsapp:+${customer.phone}`,
      })
      .then((response) => {
        setMessages(response.data.findMessages.reverse());
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
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
    axios.post(`${process.env.REACT_APP_API_URL}/api/v2/whastapp`, {
      to: `whatsapp:+${customer.phone}`,
      message: input,
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
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
        {/* Botón para activar/desactivar IA */}
        <Box sx={{ marginRight: "16px" }}>
          <Button variant="contained" color={ia ? "white" : "primary"} sx={{color:"primary"}}  onClick={handleToggleIA}>
            {ia ? "Desactivar IA" : "Activar IA"}
          </Button>
        </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "800px",
          height: "600px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {/* Title */}
        <Typography variant="h6" align="center" gutterBottom>
          Chat Conversation
        </Typography>

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
          {loading && (
            <Stack spacing={2} direction="row" alignItems="center">
              <Typography variant="body2">Cargando Conversación...</Typography>
              <Box sx={{ position: "relative" }}>
                <CircularProgress
                  variant="determinate"
                  sx={(theme) => ({
                    color: theme.palette.grey[200],
                    ...theme.applyStyles("dark", {
                      color: theme.palette.grey[800],
                    }),
                  })}
                  size={40}
                  thickness={4}
                  value={100}
                />
                <CircularProgress
                  variant="indeterminate"
                  disableShrink
                  sx={(theme) => ({
                    color: "#1a90ff",
                    animationDuration: "550ms",
                    position: "absolute",
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                      strokeLinecap: "round",
                    },
                    ...theme.applyStyles("dark", {
                      color: "#308fe8",
                    }),
                  })}
                  size={40}
                  thickness={4}
                />
              </Box>
            </Stack>
          )}
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
                  primary={msg.body}
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
    </DashboardLayout>
  );
}

export default CustomerChat;
