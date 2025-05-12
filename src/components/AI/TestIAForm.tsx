import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIAConfig } from "../../hooks/useIAConfig";
import { IAConfig } from "../../types/ia-config";
import { ChatModal } from "./ChatModal";
import LoaderBackdrop from "../ui/LoaderBackdrop";
import IASettingsPanel from "./IASettingsPanel";
//   import { getSampleDataFromCRM } from "../../utils/fetchRecords"; // opcional si usas muestra real

export const TestIAForm = ({ clientId }: { clientId: string }) => {
  const { config, loading, isNew, updateConfig, testPrompt, createConfig } = useIAConfig(clientId);
  const [localConfig, setLocalConfig] = useState<IAConfig | null>(null);
  const [canTest, setCanTest] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  console.log("loading", loading);

  // 🧠 Prompt base para casos nuevos
  const generateDefaultPrompt = (cfg: IAConfig): string => {
    console.log("cfg.name-->", cfg.name);
    return `
  Eres ${cfg.name}, un asistente virtual especializado en atención a clientes para ${cfg.clientId}.
  Tu objetivo es ${cfg.objective}. Tu estilo es ${cfg.tone}.
  Cuando un cliente entra por primera vez, salúdalo con: "${cfg.welcomeMessage}".
  
  Tu tarea es guiar a los clientes, dar seguimiento y ayudarlos a tomar decisiones.
  Habla como un humano, no como una IA. Siempre busca agendar una cita o resolver dudas.
  
  (Si el cliente pregunta por propiedades, usa la información de su CRM para responder. Si tiene dudas sobre horarios, ubicación o requisitos, ayúdalo con claridad y empatía.)`.trim();
  };

  useEffect(() => {
    if (config) {
      const defaultPrompt = isNew ? generateDefaultPrompt(config) : config.customPrompt;
      setLocalConfig({ ...config, customPrompt: defaultPrompt || "" });
    }
  }, [config, isNew]);

  const handleSave = async () => {
    if (!localConfig) return;
    await updateConfig(localConfig);
    setCanTest(true); // ahora sí puede probar
  };

  const handleCreate = async () => {
    await createConfig();
  };

  const handleResetPrompt = () => {
    if (localConfig) {
      const reset = generateDefaultPrompt(localConfig);
      setLocalConfig({ ...localConfig, customPrompt: reset });
    }
  };

  if (loading || !config) return <LoaderBackdrop open={loading} text="Cargando..." />;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      {isNew ? (
        <Box sx={{ mb: 3, p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
          <Typography variant="h6">¡Hola!</Typography>
          <Typography>
            Aún no tienes configurada tu IA. Vamos a crearla paso a paso para ayudarte a responder clientes y agendar
            citas automáticamente.
          </Typography>
          <Button variant="contained" onClick={handleCreate}>
            🚀 Iniciar configuración
          </Button>
        </Box>
      ) : (
        <>
          {localConfig && <IASettingsPanel config={localConfig} onChange={setLocalConfig} />}

          <Button onClick={handleResetPrompt} sx={{ mb: 4 }}>
            Reiniciar Prompt al Valor Predeterminado
          </Button>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            {isNew && !canTest ? (
              <Button variant="contained" onClick={handleSave}>
                Guardar configuración inicial
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={handleSave}>
                  Guardar configuración
                </Button>
                <Button variant="contained" onClick={() => setModalOpen(true)}>
                  Probar IA
                </Button>
              </>
            )}
          </Box>
        </>
      )}

      <ChatModal open={modalOpen} onClose={() => setModalOpen(false)} onSendMessage={testPrompt} />
    </Box>
  );
};
