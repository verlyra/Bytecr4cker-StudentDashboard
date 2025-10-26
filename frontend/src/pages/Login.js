// frontend/src/pages/Login.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      alert("Login Failed! Check your credentials.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "5rem auto" }}>
      <div className="nes-container with-title is-centered is-dark">
        <p className="title">Bytecr4cker - Continue</p>
        <form onSubmit={handleSubmit}>
          <div className="nes-field" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="email_field">Email</label>
            <input
              type="email"
              id="email_field"
              className="nes-input is-dark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="nes-field" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password_field">Password</label>
            <input
              type="password"
              id="password_field"
              className="nes-input is-dark"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="nes-btn is-primary">
            Login
          </button>
        </form>
        <p style={{ marginTop: "1.5rem" }}>
          Don't have an account? <Link to="/register">New Game</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;
