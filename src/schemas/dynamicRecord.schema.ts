import * as yup from "yup";

// 🔥 Esta función crea el esquema basado en los campos dinámicos
export const buildDynamicSchema = (fields: any[]) => {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    if (field.required) {
      if (field.type === "number") {
        shape[field.key] = yup
          .number()
          .typeError(`${field.label} debe ser un número`)
          .required(`${field.label} es obligatorio`);
      } else {
        shape[field.key] = yup
          .string()
          .required(`${field.label} es obligatorio`);
      }
    } else {
      if (field.type === "number") {
        shape[field.key] = yup
          .number()
          .typeError(`${field.label} debe ser un número`)
          .nullable();
      } else {
        shape[field.key] = yup.string().nullable();
      }
    }
  });

  return yup.object().shape(shape);
};
