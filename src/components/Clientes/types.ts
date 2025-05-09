export interface Cliente {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    purchasingPower?: "low" | "medium" | "high";
    paymentMethod?: {
      type: "efectivo" | "bancario" | "institucional";
      institution?: "infonavit" | "fovissste" | "cfe" | "pensiones del estado" | null;
    };
    budget?: string;
    propertyType?: "terreno" | "casa";
    intent?: "comprar" | "rentar";
    status?: string;
    customFields?: {
      key: string;
      label: string;
      value: string;
      visible: boolean;
      type?: string;
      options?: string[];
    }[];
  }
  