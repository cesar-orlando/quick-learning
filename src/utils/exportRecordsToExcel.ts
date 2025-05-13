import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportRecordsToExcel = (
  records: any[],
  fields: { key: string; label: string; type?: string; visible?: boolean; format?: string }[],
  filename: string = "datos.xlsx"
) => {
  const visibleFields = fields.filter(f => f.visible !== false);

  const data = records.map(record => {
    const row: any = {};

    visibleFields.forEach(field => {
      const match = record.customFields.find((f: any) => f.key === field.key);
      let value = match?.value ?? "";

      // Parsear asesor si es JSON
      if (field.key === "asesor" && typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          value = parsed.name || value;
        } catch {
          // mantener como string
        }
      }

      // Formatear fechas (hora del mensaje, etc.)
      if (field.key === "lastMessageTime" && value) {
        try {
          const date = new Date(value);
          value = date.toLocaleString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          // dejar valor original
        }
      }

      // Formato de moneda
      if (field.type === "number" && field.format === "currency") {
        try {
          value = new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(Number(value));
        } catch {
          // dejar como está
        }
      }

      row[field.label] = value;
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, filename);
};
