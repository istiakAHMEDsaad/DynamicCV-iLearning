import { api } from "@/lib/axios";
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/getUser");
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = api.post("/auth/login", { email, password });
    setUser(res.data.user);
    toast.success("Welcome back!");
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await api.post("/auth/register", userData);
    setUser(res.data.user);
    toast.success("Account created successfully!");
    return res.data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    toast.success("Logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
