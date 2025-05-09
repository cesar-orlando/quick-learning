import api from "../api/axios";

export const uploadFileToS3 = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      return res.data.url;
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
      return null;
    }
  };