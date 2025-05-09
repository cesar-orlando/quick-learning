import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

interface Table {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);

  // 🔥 Función que obtiene las tablas desde el servidor
  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get("/tables/list");
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // 🔥 Devolvemos tanto las tablas como la función refetch
  return { tables, refetch: fetchTables };
};
