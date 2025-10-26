// frontend/src/pages/Register.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate("/");
    } catch (error) {
      alert("Registration Failed! Try a different username or email.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "5rem auto" }}>
      <div className="nes-container with-title is-centered is-dark">
        <p className="title">Bytecr4cker - New Game</p>
        <form onSubmit={handleSubmit}>
          <div className="nes-field" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="username_field">Username</label>
            <input
              type="text"
              id="username_field"
              className="nes-input is-dark"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
          <button type="submit" className="nes-btn is-success">
            Create Account
          </button>
        </form>
        <p style={{ marginTop: "1.5rem" }}>
          Already a player? <Link to="/login">Continue</Link>
        </p>
      </div>
    </div>
  );
}
export default Register;
