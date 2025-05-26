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
  Button,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import PaymentIcon from "@mui/icons-material/Payment";
import api from "../../api/axios";
import { NewButton } from "../ui/NewButton";
import LoaderBackdrop from "../ui/LoaderBackdrop";
import { TemplateModal } from "./TemplateModal";
import { PaymentModal } from "./PaymentModal";

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
    type?: "text" | "image" | "audio" | "video" | "location";
    mediaUrl?: string;
  }

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ _id: string; name: string; status: any }[]>([]);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isWindowExpired, setIsWindowExpired] = useState(false);
  const [isOneWeekBlocked, setIsOneWeekBlocked] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
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
      const chatData = response.data || [];
      setChat(chatData);

      if (chatData.length > 0) {
        // Verificar ventana de 24h desde el último inbound
        const lastInbound = [...chatData].reverse().find((msg) => msg.direction === "inbound");
        if (lastInbound) {
          const diffInHours = (new Date().getTime() - new Date(lastInbound.dateCreated).getTime()) / (1000 * 60 * 60);
          setIsWindowExpired(diffInHours > 24);
        }

        // Verificar si hay 3 mensajes consecutivos de asesor
        const last3 = [...chatData].slice(-3);
        const allAsesor = last3.every((msg) => msg.respondedBy === "asesor");

        if (allAsesor) {
          const lastDate = new Date(last3[2].dateCreated); // El más reciente
          const diffInDays = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          setIsOneWeekBlocked(diffInDays < 7); // bloqueado si aún no pasa 1 semana
        } else {
          setIsOneWeekBlocked(false);
        }
      }
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
        setUsers(response.data.map((user: any) => ({ _id: user._id, name: user.name, status: user.status })));
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
    } finally {
      setSending(false);
    }
  };

  const templates = [
    {
      id: "HXa25e27e01d0a93a41a5871e703787526",
      label: "Seguimiento inscripción Quick Learning",
      variables: ["{{1}}"], // Usaremos solo el nombre
      preview: `Hola {{1}},
Para continuar con tu proceso de inscripción a los cursos de inglés de Quick Learning 🏫, solo necesitamos confirmar algunos datos contigo:
Modalidad preferida (presencial, virtual u online)
Horario que te acomode mejor 📅
Datos de contacto (teléfono o correo) ☎️
Una vez con esa info, te podemos apartar un lugar y enviarte los detalles completos del curso 📚.
¿Te gustaría avanzar con eso esta semana?`,
    },
    {
      id: "HXd040e0ab8c9c7f35b5ec3fab80c0263c",
      label: "Mensaje cordial para reconectar",
      variables: ["{{1}}"],
      preview: `Hola {{1}}, hace tiempo no hablamos, ¿te gustaría continuar con la información que te compartí?`,
    },
    {
      id: "HX2c7fb2b1266957b8fad06a42ba2fa1ce",
      label: "Seguimiento inscripción",
      variables: ["{{1}}"],
      preview: `Hola {{1}}, ¿te gustaría retomar tu proceso de inscripción?`,
    },
  ];

  const paymentMethods = [
    {
      id: "oxxo",
      label: "Pago OXXO, banco o transferencia",
      description: "Depósito, transferencia o pago en OXXO.",
      image: "https://realstate-virtual-voices.s3.us-east-2.amazonaws.com/Iztacalco.jpeg",
      templateId: "HX1df87ec38ef585d7051f805dec8a395b",
    },
    // Puedes agregar más métodos aquí
  ];

  if (loading) {
    return <LoaderBackdrop open={loading} />;
  }

  return (
    <>
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
            background: "#FAFAFB",
          },
        }}
      >
        {/* Columna izquierda: Información del cliente */}
        <Box
          sx={{
            width: "45%",
            paddingRight: 3,
            borderRight: "1px solid #E0E0E0",
            height: "100%", // Asegura altura completa
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0, // Necesario para scroll
              overflowY: "auto", // Scroll si el contenido es mayor
              pr: 1,
            }}
          >
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
                        {users.map(
                          (user) =>
                            user.status.toString() == "true" && (
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
                            )
                        )}
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar alt="Cliente" sx={{ width: 48, height: 48, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {nameField?.value || "Cliente"}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentModalOpen(true)}
              disabled={isOneWeekBlocked || isWindowExpired}
              sx={{
                backgroundColor: "#7B61FF",
                color: "#fff",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "12px",
                px: 2,
                py: 1,
                "&:hover": {
                  backgroundColor: "#6a54e0",
                },
              }}
            >
              Enviar pago
            </Button>
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
                    {/* Mensaje de imagen, video, audio, ubicación... */}
                    {message.body?.startsWith("🖼️ El usuario compartió una imagen:") &&
                    message.body.includes("https://") ? (
                      <img
                        src={message.body.replace("🖼️ El usuario compartió una imagen: ", "").trim()}
                        alt="Imagen recibida"
                        style={{
                          maxWidth: "100%",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      />
                    ) : message.body?.startsWith("🎥 El usuario compartió un video:") &&
                      message.body.includes("https://") ? (
                      <video
                        controls
                        style={{
                          maxWidth: "100%",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <source src={message.body.replace("🎥 El usuario compartió un video: ", "").trim()} />
                        Tu navegador no puede reproducir el video.
                      </video>
                    ) : message.body?.startsWith("🎙️ Transcripción del audio:") && message.mediaUrl ? (
                      <Box>
                        <audio
                          controls
                          style={{
                            width: "100%",
                            marginBottom: 4,
                          }}
                        >
                          <source src={message.mediaUrl} />
                          Tu navegador no soporta el elemento de audio.
                        </audio>
                        <Typography variant="body2">{message.body}</Typography>
                      </Box>
                    ) : message.body?.startsWith("📍 El usuario compartió su ubicación:") &&
                      message.body.includes("https://") ? (
                      <a
                        href={message.body.replace("📍 El usuario compartió su ubicación: ", "").trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#fff", textDecoration: "underline" }}
                      >
                        Ver ubicación en el mapa
                      </a>
                    ) : message.body?.startsWith("Aquí tienes la información para realizar tu pago a Quick Learning") ? (
                      <>
                        <Typography variant="body2">{message.body}</Typography>
                        <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                          <img
                            src="https://realstate-virtual-voices.s3.us-east-2.amazonaws.com/Iztacalco.jpeg"
                            alt="Método de pago"
                            style={{
                              maxWidth: 220,
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "#fff",
                            }}
                          />
                        </Box>
                      </>
                    ) : (
                      
                      <Typography variant="body2">{message.body}</Typography>
                    )}

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
          {isOneWeekBlocked ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="error">
                No puedes enviar más mensajes por ahora. Ya se enviaron 3 seguidos por asesor. Espera una semana para
                continuar.
              </Typography>
            </Box>
          ) : isWindowExpired ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                La ventana de 24 horas ha expirado. Solo puedes enviar un mensaje de plantilla.
              </Typography>
              <NewButton label="Seleccionar plantilla" fullWidth onClick={() => setTemplateModalOpen(true)} />
            </Box>
          ) : (
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
          )}
        </Box>
      </Drawer>
      <TemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        name={nameField?.value || "amigo/a"}
        onSend={async (preview) => {
          console.log("preview", preview);
          const phoneField = record?.customFields?.find((f: any) => f.key === "phone");
          if (!phoneField?.value) return;

          try {
            await api.post("/whatsapp/send-template", {
              phone: phoneField.value,
              templateId: preview,
              variables: [nameField?.value || "amigo/a"],
            });
            fetchChat(phoneField.value);
            setTemplateModalOpen(false);
          } catch (error) {
            console.error("Error al enviar plantilla:", error);
          }
        }}
      />
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        paymentMethods={paymentMethods}
        name={nameField?.value || "amigo/a"}
        onSend={async (method) => {
          const phoneField = record?.customFields?.find((f: any) => f.key === "phone");
          if (!phoneField?.value) return;
          try {
            await api.post("/whatsapp/send-template", {
              phone: phoneField.value,
              templateId: method.templateId,
              variables: [nameField?.value || "amigo/a"],
            });
            setPaymentModalOpen(false);
            fetchChat(phoneField.value);
          } catch (error) {
            console.error("Error al enviar método de pago:", error);
          }
        }}
      />
    </>
  );
};

export default ProspectDrawer;
