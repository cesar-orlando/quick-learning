import axios from "axios";

export const customerService = {
  getCustomers,
};

async function getCustomers() {
  try {
    const getPermissions = sessionStorage.getItem("permissions");
    const getUser = sessionStorage.getItem("user");
    let response;

    if (getPermissions === "1") {
      response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/list`);
    } else {
      response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/customers/conversations/${getUser}`);
    }

    // 🟢 Función para obtener el emoji de estado
    const getFlagEmoji = (classification, status) => {
      if (classification === "Prospecto" && status === "Interesado") return "🟢";
      if (classification === "Prospecto") return "🟡";
      if (classification === "Alumno") return "🔵";
      if (classification === "Urgente") return "🔴";
      if (["No interesado por precio", "Número equivocado", "Ofrece servicios", "No contesta"].includes(classification)) return "⚪";
      return "";
    };

    // 🔹 Obtener información del usuario para cada cliente
    const customersWithUserData = await Promise.all(response.data.customers.map(async (item) => {
      try {
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/${item.user}`);
        const userData = userResponse.data.user;

        // Obtener solo el primer nombre
        const firstName = userData.name.split(" ")[0];

        return {
          id: item._id,
          name: item.name,
          phone: item.phone,
          flagEmoji: getFlagEmoji(item.classification, item.status),
          messages: item.messages,
          status: item.status || "Desconocido",
          classification: item.classification || "Sin clasificar",
          ia: item.ia,
          user: item.user,
          userName: firstName || "Desconocido" // Agregar el primer nombre del usuario
        };
      } catch (error) {
        console.error(`Error fetching user data for user ID ${item.user}:`, error);
        return {
          id: item._id,
          name: item.name,
          phone: item.phone,
          flagEmoji: getFlagEmoji(item.classification, item.status),
          messages: item.messages,
          status: item.status || "Desconocido",
          classification: item.classification || "Sin clasificar",
          ia: item.ia,
          user: item.user,
          userName: "Desconocido" // Valor por defecto en caso de error
        };
      }
    }));

    return { data: customersWithUserData, loading: false, success: true };
  } catch (error) {
    console.error(error);
    return { data: [], loading: false, success: false };
  }
}
