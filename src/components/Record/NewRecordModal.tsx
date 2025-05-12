import { Box, Drawer, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, TextField, FormHelperText, CircularProgress, Backdrop, useTheme, useMediaQuery } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { NewButton } from "../ui/NewButton";
import api from "../../api/axios";
import { buildDynamicSchema } from "../../schemas/dynamicRecord.schema";

interface Props {
  open: boolean;
  onClose: () => void;
  slug: string;
  fields: any[];
  onSuccess: () => void;
}

export const NewRecordModal = ({ open, onClose, slug, fields, onSuccess }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const schema = buildDynamicSchema(fields);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: fields.reduce((acc: any, field: any) => {
      acc[field.key] = "";
      return acc;
    }, {}),
  });

  useEffect(() => {
    reset();
  }, [fields, open]);

  // Obtener usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user"); // Ajusta la ruta según tu API
        setUsers(response.data.map((user: any) => ({ _id: user._id, name: user.name })));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const onSubmitCreate = async (data: any) => {
    try {
      const customFields = fields.map((field: any) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        options: field.options || [],
        value: data[field.key],
        visible: field.visible,
      }));

      await api.post("/records/create", {
        tableSlug: slug,
        customFields,
      });

      onClose();
      onSuccess();
    } catch (err) {
      console.error("❌ Error al guardar registro dinámico:", err);
      alert("Error al guardar registro");
    }
  };

  const formatAsCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts[1] ? `.${parts[1].slice(0, 2)}` : "";
    return `$${intPart}${decimalPart}`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 500,
          padding: 3,
          marginTop: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
          overflowY: "auto",
          backgroundColor: "#fff",
          borderLeft: "2px solid #E5E7EB",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitCreate)}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Nuevo Registro
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {fields.map((field: any) => (
          <Controller
            key={field.key}
            name={field.key}
            control={control}
            render={({ field: controllerField }) => {
              if (field.key === "asesor") {
                const parsedValue = controllerField.value ? JSON.parse(controllerField.value) : null; // Parsear el valor si existe
                return (
                  <FormControl fullWidth error={!!errors[field.key]}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={parsedValue?._id || ""}
                      onChange={(e) => {
                        const selectedUser = users.find((user) => user._id === e.target.value);
                        if (selectedUser) {
                          controllerField.onChange(
                            JSON.stringify({ name: selectedUser.name, _id: selectedUser._id })
                          );
                        }
                      }}
                      label={field.label}
                    >
                      {users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{String(errors[field.key]?.message || "")}</FormHelperText>
                  </FormControl>
                );
              }

              if (field.type === "select") {
                return (
                  <FormControl fullWidth error={!!errors[field.key]}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select {...controllerField} label={field.label}>
                      {field.options?.map((option: string) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{String(errors[field.key]?.message || "")}</FormHelperText>
                  </FormControl>
                );
              }

              return field.type === "number" && field.format === "currency" ? (
                <TextField
                  fullWidth
                  label={field.label}
                  value={formatAsCurrency(controllerField.value?.toString() || "")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                    controllerField.onChange(raw);
                  }}
                  error={!!errors[field.key]}
                  helperText={String(errors[field.key]?.message || "")}
                />
              ) : (
                <TextField
                  {...controllerField}
                  fullWidth
                  label={field.label}
                  error={!!errors[field.key]}
                  helperText={String(errors[field.key]?.message || "")}
                />
              );
            }}
          />
        ))}

        <NewButton onClick={handleSubmit(onSubmitCreate)} label="Guardar" fullWidth />
      </Box>

      <Backdrop open={false} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Drawer>
  );
};
