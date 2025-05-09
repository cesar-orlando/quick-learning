export interface IAIntent {
  type: "read" | "write";
  intent: string;
  tableSlug: string;
}

export interface IAConfig {
  clientId: string;
  name: string;
  objective: "agendar" | "responder" | "recomendar";
  tone: "formal" | "amigable" | "persuasivo";
  welcomeMessage: string;
  customPrompt?: string;
  dataTemplate?: string;
  propertyTableSlug?: string;
  clientTableSlug?: string;
  intents?: IAIntent[];
  updatedAt?: string;
}
