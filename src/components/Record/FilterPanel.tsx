import {
    Box,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Typography,
  } from "@mui/material";
  
  interface Field {
    key: string;
    label: string;
    type: string;
    options?: string[];
    visible?: boolean;
  }
  
  type DateRangeState = { [key: string]: { start: string; end: string } };
  
  interface FilterPanelProps {
    fields: Field[];
    filters: Record<string, string>;
    setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    dateRange: DateRangeState;
    setDateRange: React.Dispatch<React.SetStateAction<DateRangeState>>;
  }
  
  export const FilterPanel = ({
    fields,
    filters,
    setFilters,
    dateRange,
    setDateRange,
  }: FilterPanelProps) => {
    const handleChange = (key: string, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    };
  
    return (
      <Box display="flex" flexDirection="column" gap={3}>
        {/* 🔘 Filtros por campo */}
        <Box>
          <Typography fontWeight="bold" variant="subtitle2" mb={1}>
            Filtros por Campo
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {fields
              .filter((f) => f.visible !== false && f.type !== "file" && f.type !== "date" && f.type !== "text")
              .map((field) => {
                const value = filters[field.key] || "";
  
                return (
                  <Box
                    key={field.key}
                    sx={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      p: 2,
                      backgroundColor: "#F9FAFB",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#374151" }}>
                      {field.label}
                    </Typography>
  
                    {field.type === "select" && field.options ? (
                      <FormControl fullWidth size="small">
                        <Select value={value} onChange={(e) => handleChange(field.key, e.target.value)} displayEmpty>
                          <MenuItem value="">(Cualquiera)</MenuItem>
                          {field.options.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        type="number"
                        value={value}
                        size="small"
                        fullWidth
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="Escribe un número..."
                      />
                    )}
                  </Box>
                );
              })}
          </Box>
        </Box>
  
        {/* 🗓 Rango de fechas */}
        <Box>
          <Typography fontWeight="bold" variant="subtitle2" mb={1}>
            Rango de Fechas
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {fields
              .filter((f) => f.visible !== false && f.type === "date")
              .map((field) => (
                <Box
                  key={field.key}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    p: 2,
                    backgroundColor: "#F9FAFB",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#374151" }}>
                    {field.label}
                  </Typography>
  
                  <Box display="flex" gap={2}>
                    <TextField
                      type="date"
                      label="Desde"
                      size="small"
                      fullWidth
                      value={dateRange[field.key]?.start || ""}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          [field.key]: {
                            ...(prev[field.key] || { start: "", end: "" }),
                            start: e.target.value,
                          },
                        }))
                      }
                    />
                    <TextField
                      type="date"
                      label="Hasta"
                      size="small"
                      fullWidth
                      value={dateRange[field.key]?.end || ""}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          [field.key]: {
                            ...(prev[field.key] || { start: "", end: "" }),
                            end: e.target.value,
                          },
                        }))
                      }
                    />
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    );
  };
  
  export default FilterPanel;
  