import { useEffect, useState } from "react";
import api from "../api/axios"; // Asegúrate que esta ruta es correcta en tu estructura

interface DashboardCounts {
  alumnos: number;
  clientes: number;
  prospectos: number;
  sinInteraccion: number;
  loading: boolean;
  error: boolean;
}

const useDashboardCounts = (): DashboardCounts => {
  const [counts, setCounts] = useState({
    alumnos: 0,
    clientes: 0,
    prospectos: 0,
    sinInteraccion: 0,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alumnosRes, clientesRes, prospectosRes, sinIntRes] = await Promise.all([
          api.get("/records/alumnos"),
          api.get("/records/clientes"),
          api.get("/records/prospectos"),
          api.get("/records/sin-contestar"),
        ]);

        const isCurrentMonth = (dateString: string): boolean => {
          const date = new Date(dateString);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        };

        const alumnosData = alumnosRes.data.records.filter((record: any) => isCurrentMonth(record.createdAt));
        const clientesData = clientesRes.data.records.filter((record: any) => isCurrentMonth(record.createdAt));
        const prospectosData = prospectosRes.data.records.filter((record: any) => isCurrentMonth(record.createdAt));
        const sinIntData = sinIntRes.data.records.filter((record: any) => isCurrentMonth(record.createdAt));

        setCounts({
          alumnos: alumnosData.length || 0,
          clientes: clientesData.length || 0,
          prospectos: prospectosData.length || 0,
          sinInteraccion: sinIntData.length || 0,
          loading: false,
          error: false,
        });
      } catch (error) {
        console.error("❌ Error al obtener conteos del dashboard:", error);
        setCounts((prev) => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchData();
  }, []);

  return counts;
};

export default useDashboardCounts;
