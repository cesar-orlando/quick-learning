import {
    Box,
    TextField,
    MenuItem,
    Typography,
    IconButton,
    Button,
  } from "@mui/material";
  import DeleteIcon from "@mui/icons-material/Delete";
  import { IAConfig, IAIntent } from "../../types/ia-config"; // Asegúrate de tener estos tipos
  
  type Props = {
    config: IAConfig;
    onChange: (updated: IAConfig) => void;
  };
  
  export default function IASettingsPanel({ config, onChange }: Props) {
    const handleChange = (field: keyof IAConfig, value: any) => {
      onChange({ ...config, [field]: value });
    };
  
    const handleIntentChange = (index: number, key: keyof IAIntent, value: string) => {
        const currentIntents = config.intents ?? []; // <-- Usar ?? []
        const newIntents = [...currentIntents];
        if (newIntents[index]) {
          newIntents[index] = {
            ...newIntents[index],
            [key]: value,
          };
          handleChange("intents", newIntents);
        }
      };
  
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Configura tu Asistente IA
        </Typography>
  
        <TextField
          fullWidth
          label="Nombre del Asistente"
          value={config.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          sx={{ mb: 2 }}
        />
  
        <TextField
          fullWidth
          select
          label="Tono"
          value={config.tone || ""}
          onChange={(e) => handleChange("tone", e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="formal">Formal</MenuItem>
          <MenuItem value="amigable">Amigable</MenuItem>
          <MenuItem value="persuasivo">Persuasivo</MenuItem>
        </TextField>
  
        <TextField
          fullWidth
          label="Mensaje de Bienvenida"
          value={config.welcomeMessage || ""}
          onChange={(e) => handleChange("welcomeMessage", e.target.value)}
          sx={{ mb: 2 }}
        />
  
        <Typography variant="h6" gutterBottom>
          Intenciones (Temas que puede responder o registrar)
        </Typography>
  
        {(config.intents ?? []).map((intent, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Intención"
              value={intent.intent}
              onChange={(e) => handleIntentChange(index, "intent", e.target.value)}
            />
            <TextField
              select
              label="Tipo"
              value={intent.type}
              onChange={(e) => handleIntentChange(index, "type", e.target.value)}
            >
              <MenuItem value="read">Leer</MenuItem>
              <MenuItem value="write">Escribir</MenuItem>
            </TextField>
            <TextField
              label="Tabla Vinculada"
              value={intent.tableSlug}
              onChange={(e) => handleIntentChange(index, "tableSlug", e.target.value)}
            />
            <IconButton
              onClick={() => {
                const updated = [...config.intents ?? []];
                updated.splice(index, 1);
                handleChange("intents", updated);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
  
        <Button
          variant="outlined"
          onClick={() => handleChange("intents", [...config.intents ?? [], { intent: "", type: "read", tableSlug: "" }])}
          sx={{ mb: 4 }}
        >
          + Agregar Intención
        </Button>
  
        <TextField
          fullWidth
          multiline
          minRows={6}
          label="Prompt Personalizado"
          value={config.customPrompt || ""}
          onChange={(e) => handleChange("customPrompt", e.target.value)}
          helperText="Define cómo debe comportarse el asistente. Puedes usar los datos y el tono definidos arriba."
        />
      </Box>
    );
  }
  