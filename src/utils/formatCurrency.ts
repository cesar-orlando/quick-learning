export function formatCurrency(value: string | number | undefined | null): string {
    if (value === undefined || value === null || value === "") return "$0";
  
    let numericValue: number;
  
    if (typeof value === "string") {
      // Remueve cualquier carácter que no sea número o punto decimal
      const cleaned = value.replace(/[^0-9.]/g, "");
  
      numericValue = parseFloat(cleaned);
    } else {
      numericValue = value;
    }
  
    if (isNaN(numericValue)) return "$0";
  
    return numericValue.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    });
  }
  