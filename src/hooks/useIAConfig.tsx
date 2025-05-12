import { useEffect, useState } from "react";
import axios from "../api/axios"; // ajusta si tienes otra instancia
import { IAConfig } from "../types/ia-config";

export const useIAConfig = (clientId: string) => {
  const [config, setConfig] = useState<IAConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const createConfig = async () => {
    try {
      const { data } = await axios.post(`/ia-config/create/${clientId}`, {
        name: "Asistente",
        tone: "amigable",
        objective: "agendar",
        welcomeMessage: "¡Hola! ¿En qué puedo ayudarte?",
      });
      setConfig(data.config);
      setIsNew(false);
    } catch (error) {
      console.error("Error al crear configuración IA:", error);
    }
  };

  const fetchConfig = async () => {
    try {
      const { data } = await axios.get(`/ia-config/${clientId}`);
      setConfig(data);
      setIsNew(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsNew(true);
        // ⬇️ Creamos un objeto vacío mínimo para poder mostrar el form
        setConfig({
          clientId,
          name: "",
          objective: "agendar",
          tone: "amigable",
          welcomeMessage: "",
          intents: [],
          customPrompt: "",
        });
      } else {
        console.error("Error cargando configuración IA:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<IAConfig>) => {
    try {
      const { data } = await axios.post(`/ia-config/${clientId}`, newConfig);
      setConfig(data.config);
    } catch (error) {
      console.error("Error al guardar configuración IA:", error);
    }
  };

  const testPrompt = async (messages: { role: "user" | "assistant"; content: string }[]) => {
    try {
      const { data } = await axios.post("/ia-config/test", {
        clientId,
        messages,
      });
      return data.reply;
    } catch (error) {
      console.error("Error al probar IA:", error);
      return "Error al generar respuesta.";
    }
  };
  

  useEffect(() => {
    fetchConfig();
  }, [clientId]);

  return {
    config,
    loading,
    isNew,
    updateConfig,
    testPrompt,
    createConfig,
  };
};
