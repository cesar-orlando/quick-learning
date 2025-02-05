import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Card,
  ListItemIcon,
  Icon,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PhotoIcon from "@mui/icons-material/Photo";
import SendIcon from "@mui/icons-material/Send";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PropTypes from "prop-types";
import axios from "axios";

const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedType, setSelectedType] = useState(null); // Group or Personal

  const handleGetUsers = () => {
    // Lógica para obtener los usuarios
    axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/`).then((response) => {
      console.log("response", response.data.users);
    }).catch((error) => {
      console.error("error", error);
    });
  };

  useEffect(() => {
    handleGetUsers();
  }, []);
  

  // Estado para almacenar los mensajes de cada chat
// Estado para almacenar los mensajes de cada chat
const [chatMessages, setChatMessages] = useState({
    1: [
      { sender: "John", text: "Hi everyone!" },
      { sender: "You", text: "Hello John, how's it going?" },
      { sender: "Sarah", text: "Good morning team!" },
    ],
    2: [
      { sender: "Manager", text: "Don't forget to submit your weekly updates." },
      { sender: "You", text: "Working on it, will send it shortly." },
      { sender: "Alice", text: "I just submitted mine." },
    ],
    3: [
      { sender: "Team Lead", text: "Let's focus on the UI updates this week." },
      { sender: "You", text: "Got it, I'll prioritize the login page." },
      { sender: "Designer", text: "I'm updating the color palette now." },
    ],
    4: [
      { sender: "Alice Johnson", text: "Hey, are you free for a quick call?" },
      { sender: "You", text: "Sure, give me 5 minutes." },
    ],
    5: [
      { sender: "Bob Smith", text: "Can you share the latest project report?" },
      { sender: "You", text: "Check your inbox, I just sent it." },
    ],
    6: [
      { sender: "Charlie Brown", text: "Let's catch up soon!" },
      { sender: "You", text: "Absolutely, let me know when you're free." },
    ],
  });
  

  const groups = [
    { id: 1, name: "General" },
    { id: 2, name: "Team Updates" },
    { id: 3, name: "Project Discussion" },
  ];

  const personalChats = [
    { id: 4, name: "Alice Johnson" },
    { id: 5, name: "Bob Smith" },
    { id: 6, name: "Charlie Brown" },
  ];

  const handleChatSelection = (id, type) => {
    setSelectedChat(id);
    setSelectedType(type);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      // Agregar el mensaje al chat seleccionado
      setChatMessages((prevMessages) => ({
        ...prevMessages,
        [selectedChat]: [...(prevMessages[selectedChat] || []), { sender: "You", text: message }],
      }));
      setMessage(""); // Limpiar el campo de texto
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ marginTop: 25, height: "80vh" }}>
        <MDBox /* pt={1} pb={1} */ sx={{ display: "flex", height: "100%" }}>
          {/* Sidebar */}
          <Card
            sx={{
              width: "300px",
              borderRight: "1px solid #ccc",
              padding: "10px",
              bgcolor: "#f7f9fc",
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: "20px" }}>
              Chats
            </Typography>

            {/* Group Chats */}
            <Typography variant="subtitle1" sx={{ marginBottom: "10px", color: "#888" }}>
              Groups
            </Typography>

            <List>
              {groups.map((group) => (
                <ListItem
                  button
                  key={group.id}
                  selected={selectedChat === group.id && selectedType === "group"}
                  onClick={() => handleChatSelection(group.id, "group")}
                  sx={{
                    borderRadius: "5px",
                    "&.Mui-selected": {
                        background: "linear-gradient(90deg, #4A90E2, #57BBF4)", // Gradiente azul
                    },
                  }}
                >
                  <ListItemText primary={group.name} sx={{margin:"5px", fontWeight:"bold" }} />
                </ListItem>
              ))}
            </List>

            {/* Personal Chats */}
            <Typography
              variant="subtitle1"
              sx={{ marginTop: "20px", marginBottom: "10px", color: "#888" }}
            >
              Personal Chats
            </Typography>
            <List>
              {personalChats.map((chat) => (
                <ListItem
                  button
                  key={chat.id}
                  selected={selectedChat === chat.id && selectedType === "personal"}
                  onClick={() => handleChatSelection(chat.id, "personal")}
                  sx={{
                    borderRadius: "5px",
                    "&.Mui-selected": {
                        background: "linear-gradient(90deg, #4A90E2, #57BBF4)", // Gradiente azul
                    },
                  }}
                >
                  <ListItemText primary={chat.name} sx={{margin:"5px", fontWeight:"bold" }} />
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Chat Area */}
          <MDBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Chat Header */}
            {selectedChat ? (
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  {`${selectedType === "group" ? "Group: " : "Chat with "}${
                    selectedType === "group"
                      ? groups.find((g) => g.id === selectedChat).name
                      : personalChats.find((c) => c.id === selectedChat).name
                  }`}
                </MDTypography>
              </MDBox>
            ) : null}

            {/* Messages */}
            <MDBox
              sx={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                bgcolor: "#f7f9fc",
              }}
            >
              {selectedChat ? (
                (chatMessages[selectedChat] || []).map((msg, index) => (
                  <Paper
                    key={index}
                    sx={{
                      margin: "5px 0",
                      padding: "10px",
                      maxWidth: "70%",
                      alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                      bgcolor: msg.sender === "You" ? "#e1f5fe" : "#fff",
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{msg.sender}</strong>
                    </Typography>
                    <Typography variant="body1">{msg.text}</Typography>
                  </Paper>
                ))
              ) : (
                <MDBox
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography>Select a chat to start messaging</Typography>
                </MDBox>
              )}
            </MDBox>

            {/* Input Area */}
            {selectedChat && (
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  borderTop: "1px solid #ccc",
                  bgcolor: "#fff",
                  borderRadius: "16px",
                }}
              >
                <IconButton>
                  <AttachFileIcon />
                </IconButton>
                <IconButton>
                  <PhotoIcon />
                </IconButton>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Evita el salto de línea
                      handleSendMessage(); // Envía el mensaje
                    }
                  }}
                  sx={{ marginX: "10px" }}
                />
                <Button variant="contained" onClick={handleSendMessage} endIcon={<SendIcon />}>
                  Send
                </Button>
              </MDBox>
            )}
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
};

export default ChatApp;
