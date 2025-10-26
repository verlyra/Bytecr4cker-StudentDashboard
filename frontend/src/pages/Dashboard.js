// frontend/src/pages/Dashboard.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.js";

// Import semua widget Anda
import WeatherWidget from "../components/WeatherWidget.js";
import TasksWidget from "../components/TasksWidget.js";
import PomodoroWidget from "../components/PomodoroWidget.js";
import SpotifyWidget from "../components/SpotifyWidget.js";
import ShortcutsWidget from "../components/ShortcutsWidget.js";
import CalendarWidget from "../components/CalendarWidget.js";
// 1. Import komponen NotesWidget yang baru
import NotesWidget from "../components/NotesWidget.js";

function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks in Dashboard", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  return (
    <div>
      <header
        style={{
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "4px solid #fff",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem" }}>Bytecr4cker</h1>
        <div>
          <span style={{ marginRight: "1.5rem" }}>
            Player: {user ? user.username : "..."}
          </span>
          <button onClick={logout} className="nes-btn is-error">
            Logout
          </button>
        </div>
      </header>

      {/* Grid Utama untuk Widget */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "1.5rem",
          padding: "1.5rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <WeatherWidget />
        <CalendarWidget
          tasks={tasks}
          currentDate={currentDate}
          onPrevMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
        <PomodoroWidget />
        <TasksWidget
          tasks={tasks}
          currentDate={currentDate}
          onTasksChange={fetchTasks}
        />
        <SpotifyWidget />
        <ShortcutsWidget />
      </main>

      {/* 2. Tambahkan container baru untuk NotesWidget di bawah <main> */}
      <div
        className="notes-container"
        style={{
          padding: "0 1.5rem 1.5rem", // Padding atas 0, sisanya sama dengan main
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <NotesWidget />
      </div>

      <footer className="pixel-footer">
        <p>
          © 2025 Made with <i className="nes-icon is-small heart"></i> - Verly
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;
