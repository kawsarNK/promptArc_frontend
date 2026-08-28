"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "promptarc_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((response) => {
    window.localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const saved = token || window.localStorage.getItem(TOKEN_KEY);
    if (!saved)
      return null;
    const { user: current } = await api.me(saved);
    setToken(saved);
    setUser(current);
    return current;
  }, [token]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const saved = window.localStorage.getItem(TOKEN_KEY);
      if (!saved) {
        if (active)
          setLoading(false);
        return;
      }
      if (active)
        setToken(saved);
      try {
        const { user: current } = await api.me(saved);
        if (active)
          setUser(current);
      }
      catch {
        window.localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      }
      finally {
        if (active)
          setLoading(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login: async (email, password) => persist(await api.login({ email, password })),
    register: async (values) => persist(await api.register(values)),
    googleLogin: async (credential) => persist(await api.googleLogin(credential)),
    logout,
    refreshUser,
    updateUser: setUser,
  }), [user, token, loading, persist, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
