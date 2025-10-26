// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Atur base URL dan header Authorization untuk semua request axios
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get("http://127.0.0.1:5000/api/auth/user")
        .then((res) => setUser(res.data))
        .catch(() => {
          // Jika token tidak valid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post("http://127.0.0.1:5000/api/auth/login", {
      email,
      password,
    });
    setToken(res.data.token);
  };

  const register = async (username, email, password) => {
    const res = await axios.post("http://127.0.0.1:5000/api/auth/register", {
      username,
      email,
      password,
    });
    setToken(res.data.token);
  };

  const logout = () => {
    setToken(null);
  };

  const value = { token, user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
