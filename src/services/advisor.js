import axios from "axios";

export const advisorService = {
    getAdvisors,
    deleteAdvisor,
    createAdvisor
};

async function getAdvisors() {
    try {

        const status = [
            "",
            "Activo",
            "Inactivo",
            "Eliminado",
            "Cliente",
            "Desconocido"
        ]

        const permissions = [
            "SuperAdmin",
            "Administrador",
            "Asistente",
            "Asesor",
            "Cliente",
            "Desconocido"
        ]

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/all`)
            .then(response => {
                console.log("response", response.data.users);
                return {
                    success: true,
                    loading: false,
                    users: response.data.users.map(item => {
                        return {
                            id: item._id,
                            name: item.name,
                            email: item.email,
                            phone: item.phone,
                            permissions: permissions[item.permissions] ? permissions[item.permissions] : "Desconocido",
                            status: status[item.status] ? status[item.status] : "Desconocido",
                        }
                    })
                }
            }
            ).catch(error => {
                console.error("Error fetching advisors:", error);
                throw error;
            });

        return response;


    } catch (error) {
        console.error("Error fetching advisors:", error);
        throw error;

    }
}

async function createAdvisor(advisorData) {
    try {
        // const data = JSON.stringify(advisorData);
        console.log("data", advisorData);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_API_URL}/api/v1/user`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}` // Obtén el token desde el sessionStorage
            },
            data: advisorData
        };

        const response = await axios.request(config);
        console.log("Advisor creado:", response.data);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error("Error creando el asesor:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Nueva función para eliminar un asesor
async function deleteAdvisor(advisorId) {
    try {
        const data = JSON.stringify({
            status: 3 // Cambiar el estado a "3" (eliminado)
        });

        const config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_API_URL}/api/v1/user/update/${advisorId}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config);
        console.log("Advisor eliminado:", response.data);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error("Error eliminando el asesor:", error);
        return {
            success: false,
            error: error.message
        };
    }
}