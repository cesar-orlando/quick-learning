import { useState } from "react";
import api from "../api/axios"; // Ajusta el path si es diferente en tu proyecto

interface EmojiSuggestion {
  emoji: string;
  label: string;
}

export const useSuggestIcons = () => {
  const [icons, setIcons] = useState<EmojiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIcons = async (tableName: string) => {
    if (!tableName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/icons/suggest-icons", { tableName });
      setIcons(res.data.icons);
    } catch (err) {
      console.error(err);
      setError("Error al sugerir iconos.");
    } finally {
      setLoading(false);
    }
  };

  return {
    icons,
    loading,
    error,
    fetchIcons,
  };
};
