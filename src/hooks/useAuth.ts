import { useState, useCallback } from "react";
import { getCurrentUser, login as authLogin, register as authRegister, logout as authLogout } from "@/lib/auth";
import type { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const login = useCallback((email: string, password: string): boolean => {
    const u = authLogin(email, password);
    if (u) {
      setUser(u);
      return true;
    }
    return false;
  }, []);

  const register = useCallback((name: string, email: string, password: string): User => {
    const u = authRegister(name, email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return { user, login, register, logout, isAuthenticated: !!user };
}
