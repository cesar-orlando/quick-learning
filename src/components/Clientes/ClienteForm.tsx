import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { buildClientSchema } from "../../schemas/clienteDynamic.schema";
import FileDropzone from "../FileDropzone";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitCreate: (data: any) => void;
  visibleFields: any[];
  isLoading: boolean;
}

export const ClienteForm = ({
  open,
  onClose,
  onSubmitCreate,
  visibleFields,
  isLoading,
}: Props) => {
  const schema = buildClientSchema(visibleFields);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: "",
      phone: "",
      ...visibleFields.reduce((acc: Record<string, string>, field) => {
        acc[field.key] = "";
        return acc;
      }, {}),
    },
  });

  useEffect(() => {
    reset(); // se reinicia cada vez que abre
  }, [visibleFields, open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
        component="form"
        onSubmit={handleSubmit(onSubmitCreate)}
      >
        <Typography variant="h6" gutterBottom>
          Nuevo Cliente
        </Typography>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={String(errors.name?.message || "")}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Teléfono"
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={String(errors.phone?.message || "")}
            />
          )}
        />

        {visibleFields.map(
          (field: {
            key: keyof typeof errors;
            label: string;
            type?: string;
            options?: string[];
          }) => (
            <Controller
              key={field.key}
              name={field.key as any}
              control={control}
              render={({ field: controllerField }) => {
                console.log("RENDER FIELD", field);
                if (field.type === "select") {
                  return (
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!errors[field.key]}
                    >
                      <InputLabel>{field.label}</InputLabel>
                      <Select {...controllerField} label={field.label}>
                        {field.options?.map((option: string) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {String(errors[field.key]?.message || "")}
                      </FormHelperText>
                    </FormControl>
                  );
                } else if (field.type === "file") {
                  return (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {field.label}
                      </Typography>
                      <FileDropzone
                        value={controllerField.value || []}
                        onChange={(urls) => controllerField.onChange(urls)}
                      />
                    </Box>
                  );
                }

                return (
                  <TextField
                    {...controllerField}
                    fullWidth
                    margin="normal"
                    label={field.label}
                    error={!!errors[field.key as keyof typeof errors]}
                    helperText={String(errors[field.key]?.message || "")}
                  />
                );
              }}
            />
          )
        )}

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Guardar
        </Button>

        <Backdrop open={isLoading} sx={{ zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Modal>
  );
};
