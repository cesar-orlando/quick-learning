import axios from "axios";

export const customerService = {
  getCustomers,
};

async function getCustomers(page = 1, limit = 500) {
  try {
    const getPermissions = sessionStorage.getItem("permissions");
    const getUser = sessionStorage.getItem("user");

    const endpoint = getPermissions === "1"
      ? `${process.env.REACT_APP_API_URL}/api/v1/quicklearning/list?page=${page}&limit=${limit}`
      : `${process.env.REACT_APP_API_URL}/api/v1/quicklearning/customers/conversations/${getUser}`;

    const response = await axios.get(endpoint);

    const customersWithUserData = await Promise.all(response.data.customers.map(async (item) => {
      try {
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/${item.user}`);
        const userData = userResponse.data.user;
        const firstName = userData.name.split(" ")[0];

        return {
          id: item._id,
          name: item.name,
          phone: item.phone,
          messages: item.messages,
          status: item.status || "Desconocido",
          classification: item.classification || "Sin clasificar",
          ia: item.ia,
          user: item.user,
          userName: firstName
        };
      } catch {
        return {
          id: item._id,
          name: item.name,
          phone: item.phone,
          messages: item.messages,
          status: item.status || "Desconocido",
          classification: item.classification || "Sin clasificar",
          ia: item.ia,
          user: item.user,
          userName: "Desconocido"
        };
      }
    }));

    return {
      data: customersWithUserData,
      total: response.data.total,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return { data: [], total: 0, success: false };
  }
}

