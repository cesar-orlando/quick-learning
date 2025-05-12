import * as yup from "yup";

export const clienteSchema = yup.object().shape({
  name: yup.string().required("El nombre es obligatorio"),
  phone: yup
    .string()
    .required("Teléfono obligatorio")
    .min(8, "Teléfono demasiado corto")
    .max(10, "Teléfono demasiado largo"),
});
