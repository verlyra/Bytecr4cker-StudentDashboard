import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function TasksWidget({ tasks, currentDate, onTasksChange }) {
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const listRef = useRef(null);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await axios.post("http://127.0.0.1:5000/api/tasks", {
        title: newTask,
        due_date: newDeadline || null,
      });

      setNewTask("");
      setNewDeadline("");
      await onTasksChange();

      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (err) {
      console.error("Failed to add task:", err);
      alert("Gagal menambahkan quest baru. Coba lagi ya!");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/tasks/${task.id}`, {
        is_completed: !task.is_completed,
      });
      onTasksChange();
    } catch (error) {
      console.error("Failed to toggle task", error);
      alert("Could not update task status. Please try again.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Yakin hapus quest ini?")) {
      await axios.delete(`http://127.0.0.1:5000/api/tasks/${id}`);
      onTasksChange();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getUTCFullYear() === currentDate.getFullYear() &&
        taskDate.getUTCMonth() === currentDate.getMonth()
      );
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div
      className="nes-container with-title is-dark"
      style={{
        minHeight: "300px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <p className="title">Quest Log - {monthNames[currentDate.getMonth()]}</p>

      <form onSubmit={handleAddTask} style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            type="text"
            className="nes-input is-dark"
            placeholder="New Quest..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            type="date"
            className="nes-input is-dark"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            style={{ flex: 1, minWidth: "120px" }}
          />
        </div>
        <button
          type="submit"
          className="nes-btn is-primary"
          style={{ width: "100%" }}
        >
          Add Quest
        </button>
      </form>

      <div
        ref={listRef}
        className="lists"
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "5px",
          maxHeight: "250px",
          scrollBehavior: "smooth",
        }}
      >
        {filteredTasks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            No quests with deadlines this month.
          </p>
        ) : (
          <ul className="nes-list is-circle">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    className="nes-checkbox is-dark"
                    checked={task.is_completed}
                    onChange={() => handleToggleTask(task)}
                  />
                  <span
                    style={{
                      textDecoration: task.is_completed
                        ? "line-through"
                        : "none",
                      transition: "opacity 0.3s ease",
                      opacity: task.is_completed ? 0.6 : 1,
                    }}
                  >
                    {task.title}
                    {task.due_date && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "#e76e55",
                          display: "block",
                        }}
                      >
                        Due: {formatDate(task.due_date)}
                      </span>
                    )}
                  </span>
                </label>

                <button
                  type="button"
                  className="nes-btn is-error"
                  style={{ padding: "0 5px", height: "35px" }}
                  onClick={() => handleDeleteTask(task.id)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TasksWidget;
