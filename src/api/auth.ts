import api from "./axios";

export async function login(email: string, password: string) {
  const res = await api.post("/usuarios/login", { email, password });
  return res.data;
}
