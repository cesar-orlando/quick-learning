import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material"; // Importa Snackbar y Alert
import "./DropDownChat.css";
import PropTypes from "prop-types";

const DropdownChat = ({ id, messages, customer, getCustomers }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState(""); // Estado para el input del mensaje
    const [loading, setLoading] = useState(false); // Estado de carga mientras se envía el mensaje
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const messagesEndRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // 🔹 Cuando se abre, baja automáticamente al último mensaje
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [isOpen, messages]);

    // 🔹 Formateo de fecha
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("es-MX", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "America/Mexico_City",
        });
    };

    // 🔹 Función para enviar mensajes
    const sendMessage = () => {
        if (newMessage.trim() === "") return;
        setLoading(true);

        axios.post(`${process.env.REACT_APP_API_URL}/api/v2/whastapp`, {
            to: `${customer.phone}`,
            message: newMessage,
        }).then((response) => {
            console.log("Mensaje enviado:", response);
            setSnackbarMessage("Mensaje enviado correctamente");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
        }).catch((error) => {
            console.log("Error al enviar el mensaje:", error.message );
            console.error("Error al enviar el mensaje:", error.message);
            setSnackbarMessage("Error al enviar el mensaje");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }).finally(() => {
            setLoading(false);
            setNewMessage("");
            getCustomers();
        });
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div className="dropdown">
            <input
                hidden=""
                className="sr-only"
                name={`state-dropdown-${id}`}
                id={`state-dropdown`}
                type="checkbox"
                checked={isOpen}
                onChange={toggleDropdown}
            />
            <label
                aria-label="dropdown scrollbar"
                htmlFor={`state-dropdown-${id}`}
                className="trigger"
                onClick={toggleDropdown}
            ></label>

            <ul className="list webkit-scrollbar" role="list" dir="auto">
                {messages.map((message) => (
                    <li key={message._id} className="listitem">
                        <article className="article">
                            <strong>{formatDate(message.dateCreated)}</strong>
                            <br />
                            {message.direction === "inbound" ? "👤" : "🤖"} {message.body}
                        </article>
                    </li>
                ))}
                <div ref={messagesEndRef} />
            </ul>

            {/* 🔹 Input para escribir mensajes */}
            <div className="message-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    disabled={loading} // 🔹 Deshabilitar input si está enviando
                />
                <button onClick={sendMessage} disabled={loading}>
                    {loading ? "Enviando..." : "Enviar"} {/* 🔹 Cambia el texto si está cargando */}
                </button>
            </div>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

DropdownChat.propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
    customer: PropTypes.shape({
        phone: PropTypes.string.isRequired,
    }).isRequired,
    getCustomers: PropTypes.func.isRequired,
};

export default DropdownChat;
