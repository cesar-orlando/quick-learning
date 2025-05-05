import axios from "axios";

export const sedesService = {
    getSedes,
};

async function getSedes() {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/sedes`);
        return { data: response.data.sedes, success: true, loading: false };
    } catch (error) {
        console.error("Error fetching sedes:", error);
        throw {
            message: "Error fetching sedes",
            success: false,
            loading: false,
        };
    }


}