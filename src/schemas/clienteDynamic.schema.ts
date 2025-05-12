import { clienteSchema } from "./cliente.schema";
import * as yup from "yup";

export const buildClientSchema = (
  customFields: {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    required?: boolean;
  }[]
) => {
  const dynamicFields: { [key: string]: any } = {};

  customFields.forEach((field) => {
    const isRequired = field.required;
    const label = `El campo "${field.label}" es obligatorio`;

    switch (field.type) {
      case "select":
        dynamicFields[field.key] = isRequired
          ? yup.string().required(label)
          : yup.string().nullable();
        break;

      case "number":
        dynamicFields[field.key] = isRequired
          ? yup.number().typeError(label).required(label)
          : yup.number().nullable();
        break;

      case "file":
        dynamicFields[field.key] = isRequired
          ? yup
              .array()
              .of(yup.string().url("Debe ser una URL válida"))
              .min(1, label)
          : yup.array().of(yup.string().url()).nullable();
        break;

      default: // text u otros
        dynamicFields[field.key] = isRequired
          ? yup.string().required(label)
          : yup.string().nullable();
    }
  });

  return clienteSchema.concat(yup.object(dynamicFields));
};
