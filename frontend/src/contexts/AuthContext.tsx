import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/api/user.api";

interface AuthContextProps {
  user: any | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({ user: null, loading: true, refresh: async () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setUser(res.user ?? res);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt to load current user on mount
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
