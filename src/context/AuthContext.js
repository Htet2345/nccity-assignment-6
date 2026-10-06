import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api";

const SESSION_KEY = "common-ground-user";
const AuthContext = createContext(null);

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function storedUser() {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);

  const saveSession = (nextUser) => {
    const safeUser = publicUser(nextUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const login = async (identifier, password) => {
    const users = await api.getUsers();
    const normalized = identifier.trim().toLowerCase();
    const match = users.find(
      (candidate) =>
        (candidate.email.toLowerCase() === normalized ||
          candidate.phone.replace(/\s/g, "") === identifier.replace(/\s/g, "")) &&
        candidate.password === password
    );

    if (!match) throw new Error("The email/phone or password is incorrect.");
    saveSession(match);
    return publicUser(match);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, updateSession: saveSession }),
    // saveSession only closes over the stable state setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
