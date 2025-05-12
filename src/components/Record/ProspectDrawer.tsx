import {
  Drawer,
  Typography,
  Box,
  Divider,
  TextField,
  Select,
  MenuItem,
  Avatar,
  Fade,
  OutlinedInput,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { NewButton } from "../ui/NewButton";
import LoaderBackdrop from "../ui/LoaderBackdrop";

interface Field {
  key: string;
  label: string;
  value: any;
  type?: string;
  options?: string[];
  visible?: boolean;
  format?: string;
}

interface ProspectDrawerProps {
  open: boolean;
  onClose: () => void;
  record: any;
  editingFields: Field[];
  setEditingFields: (fields: Field[]) => void;
  onSave: (updated: any) => Promise<void>;
}

const ProspectDrawer = ({ open, onClose, record, editingFields, setEditingFields, onSave }: ProspectDrawerProps) => {
  interface ChatMessage {
    body: string;
    dateCreated: string;
    direction: "inbound" | "outbound";
    respondedBy?: string;
  }

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Ref para el contenedor del chat
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const nameField = record?.customFields?.find((field: any) => field.key === "name");

  useEffect(() => {
    const phoneField = record?.customFields?.find((field: any) => field.key === "phone");
    if (open && phoneField?.value) {
      fetchChat(phoneField.value);
    }
  }, [open, record]);

  const fetchChat = async (phone: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/whatsapp/chat/${phone}`);
      setChat(response.data || []);
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // Desplazar al final del chat cuando los mensajes cambien
  useEffect(() => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  }, [chat]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user"); // Ajusta la ruta según tu API
        setUsers(response.data.map((user: any) => ({ _id: user._id, name: user.name })));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (key: string, value: any) => {
    const updated = editingFields.map((f) => (f.key === key ? { ...f, value } : f));
    setEditingFields(updated);
  };

  const handleSubmit = async () => {
    const updatedRecord = {
      ...record,
      customFields: editingFields.map((f) => ({
        key: f.key,
        label: f.label,
        value: f.value,
        type: f.type,
        options: f.options || [],
        visible: f.visible ?? true,
        format: f.format || "default",
      })),
    };
    await onSave(updatedRecord);
  };

  const handleSendMessage = async () => {
    const phoneField = record?.customFields?.find((f: any) => f.key === "phone");

    if (!phoneField?.value || !messageText.trim()) return;

    const payload = {
      phone: phoneField.value,
      message: messageText.trim(),
    };

    setSending(true);

    try {
      await api.post("/whatsapp/send-message", payload);
      setMessageText(""); // Limpia el campo
      fetchChat(phoneField.value); // Refresca el chat
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally{
      setSending(false);
    }
  };

  if (loading) {
    return <LoaderBackdrop open={loading} />;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "80%",
          padding: 3,
          display: "flex",
          flexDirection: "row",
          marginTop: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
          background: "#FAFAFB", // fondo más suave
        },
      }}
    >
      {/* Columna izquierda: Información del cliente */}
      <Box sx={{ width: "45%", paddingRight: 3, borderRight: "1px solid #E0E0E0" }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#7B61FF" }}>
          Prospecto
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {editingFields.map((field) => {
          if (field.key === "asesor") {
            const parsedValue = field.value ? JSON.parse(field.value) : null; // Parsear el valor si existe
            return (
              <Box key={field.key} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {field.label}
                </Typography>
                {isAdmin ? (
                  <Select
                    fullWidth
                    value={parsedValue?._id || ""} // Mostrar el _id como valor seleccionado
                    onChange={(e) => {
                      const selectedUser = users.find((user) => user._id === e.target.value);
                      if (selectedUser) {
                        handleChange(field.key, JSON.stringify({ name: selectedUser.name, _id: selectedUser._id }));
                      }
                    }}
                    size="small"
                    displayEmpty
                    input={
                      <OutlinedInput
                        notched={false}
                        sx={{
                          borderRadius: 3,
                          backgroundColor: "#fff",
                          boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
                          "& fieldset": {
                            borderColor: "transparent",
                          },
                          "&:hover fieldset": {
                            borderColor: "#D0D0D0",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#7B61FF",
                            boxShadow: "0 0 0 2px rgba(123, 97, 255, 0.2)",
                          },
                          paddingRight: "32px", // espacio para la flechita
                        }}
                      />
                    }
                  >
                    {users.map((user) => (
                      <MenuItem
                        key={user._id}
                        value={user._id}
                        sx={{
                          borderRadius: 2,
                          paddingY: 1,
                          paddingX: 2,
                          fontSize: "14px",
                          fontWeight: 500,
                          display: "flex",
                          justifyContent: "space-between",
                          "&:hover": {
                            backgroundColor: "#F0ECFF",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#E5DFFF",
                            fontWeight: 600,
                            color: "#7B61FF",
                            "&:hover": {
                              backgroundColor: "#E0DAFF",
                            },
                          },
                        }}
                      >
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {parsedValue?.name || "No asignado"}
                  </Typography>
                )}
              </Box>
            );
          }

          if (field.type === "select") {
            return (
              <Box key={field.key} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {field.label}
                </Typography>
                <Select
                  fullWidth
                  value={field.value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  size="small"
                  displayEmpty
                  input={
                    <OutlinedInput
                      notched={false}
                      sx={{
                        borderRadius: 3,
                        backgroundColor: "#fff",
                        boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
                        "& fieldset": {
                          borderColor: "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: "#D0D0D0",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7B61FF",
                          boxShadow: "0 0 0 2px rgba(123, 97, 255, 0.2)",
                        },
                        paddingRight: "32px", // espacio para la flechita
                      }}
                    />
                  }
                >
                  {field.options?.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{
                        borderRadius: 2,
                        paddingY: 1,
                        paddingX: 2,
                        fontSize: "14px",
                        fontWeight: 500,
                        display: "flex",
                        justifyContent: "space-between",
                        "&:hover": {
                          backgroundColor: "#F0ECFF",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "#E5DFFF",
                          fontWeight: 600,
                          color: "#7B61FF",
                          "&:hover": {
                            backgroundColor: "#E0DAFF",
                          },
                        },
                      }}
                    >
                      {option === "true" ? "Activo" : option === "false" ? "Inactivo" : option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            );
          }

          return (
            <Box key={field.key} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                {field.label}
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={field.value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
                    "& fieldset": {
                      borderColor: "transparent", // sin borde inicial
                    },
                    "&:hover fieldset": {
                      borderColor: "#D0D0D0", // borde tenue en hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7B61FF", // borde morado al focus
                      boxShadow: "0 0 0 2px rgba(123, 97, 255, 0.2)", // glow morado al focus
                    },
                  },
                  "& input": {
                    padding: "10px 14px",
                  },
                }}
              />
            </Box>
          );
        })}
        <NewButton fullWidth label="Guardar Cambios" onClick={handleSubmit} />
      </Box>

      {/* Columna derecha: Chat */}
      <Box
        sx={{
          width: "55%",
          paddingLeft: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header del chat */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar alt="Cliente" sx={{ width: 48, height: 48, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {nameField?.value || "Cliente"}
          </Typography>
        </Box>
        <Divider />

        {/* Aquí el contenedor que SÍ hace scroll */}
        <Box
          ref={chatContainerRef} // ✅ el ref VA AQUÍ
          sx={{
            flex: 1,
            overflowY: "auto", // ✅ el scroll VA AQUÍ
            display: "flex",
            flexDirection: "column",
            py: 2,
            gap: 1,
            background: "#F7F7FA",
            borderRadius: 3,
          }}
        >
          {chat.length > 0 ? (
            chat.map((message, index) => (
              <Fade in timeout={500} key={index}>
                <Box
                  sx={{
                    maxWidth: "75%",
                    alignSelf: message.direction === "inbound" ? "flex-start" : "flex-end",
                    backgroundColor: message.direction === "inbound" ? "#FF5BAE" : "#7B61FF",
                    color: "#fff",
                    px: 2,
                    py: 1,
                    borderRadius: message.direction === "inbound" ? "12px 12px 12px 0" : "12px 12px 0 12px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body2">{message.body}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: message.direction === "inbound" ? "left" : "right",
                      color: "#E0E0E0",
                      mt: 0.5,
                    }}
                  >
                    {new Date(message.dateCreated).toLocaleString()}
                  </Typography>
                </Box>
              </Fade>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
              No hay mensajes disponibles.
            </Typography>
          )}
        </Box>

        {/* Campo de entrada */}
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <TextField
            placeholder="Escribe un mensaje..."
            fullWidth
            multiline
            disabled={sending}
            rows={1}
            maxRows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "#D0D0D0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#7B61FF",
                  boxShadow: "0 0 0 2px rgba(123, 97, 255, 0.2)",
                },
              },
              "& textarea": {
                padding: "5px 7px",
              },
            }}
          />

          <NewButton label="Enviar" disabled={sending || !messageText.trim()} onClick={handleSendMessage} />
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProspectDrawer;
