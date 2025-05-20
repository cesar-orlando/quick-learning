import { useEffect, useState } from "react";
import api from "../api/axios"; // Ajusta según tu estructura

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  status: boolean;
  createdAt: string;
}

export const useActiveUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/user"); // Asegúrate de tener este endpoint
        const activos = res.data.filter((u: User) => u.status === true);
        setUsers(activos);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

interface UserStats {
  userId: string;
  alumnos: number;
  clientes: number;
  prospectos: number;
  sinInteraccion: number;
}

export const useUserStats = (users: any) => {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results: UserStats[] = [];

        for (const user of users) {
          const [alumnos, clientes, prospectos, sinInteraccion] = await Promise.all([
            api.get(`/whatsapp/alumnos/${user._id}`),
            api.get(`/whatsapp/clientes/${user._id}`),
            api.get(`/whatsapp/prospectos/${user._id}`),
            api.get(`/whatsapp/sin-contestar/${user._id}`),
          ]);

          results.push({
            userId: user._id,
            alumnos:
              alumnos.data.total ??
              alumnos.data.records?.length ??
              (Array.isArray(alumnos.data) ? alumnos.data.length : 0),
            clientes:
              clientes.data.total ??
              clientes.data.records?.length ??
              (Array.isArray(clientes.data) ? clientes.data.length : 0),
            prospectos:
              prospectos.data.total ??
              prospectos.data.records?.length ??
              (Array.isArray(prospectos.data) ? prospectos.data.length : 0),
            sinInteraccion:
              sinInteraccion.data.total ??
              sinInteraccion.data.records?.length ??
              (Array.isArray(sinInteraccion.data) ? sinInteraccion.data.length : 0),
          });
        }

        setStats(results);
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (users.length > 0) {
      fetchStats();
    }
  }, [users]);

  return { stats, loading, error };
};
