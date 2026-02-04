import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const stored = typeof window !== "undefined"
    ? localStorage.getItem("mychatapp:user")
    : null;

  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  return (
    <AuthContext.Provider value={[user, setUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

