import React, { useState, useEffect, useRef } from "react";

function PomodoroWidget() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          // Timer selesai
          alert(
            isBreak ? "Break is over! Time to focus." : "Time for a break!"
          );
          toggleTimerType();
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    // Cleanup function
    return () => clearInterval(intervalRef.current);
  }, [isActive, seconds, minutes, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const toggleTimerType = () => {
    setIsActive(false);
    const nextIsBreak = !isBreak;
    setIsBreak(nextIsBreak);
    setMinutes(nextIsBreak ? 5 : 25);
    setSeconds(0);
  };

  const padTime = (time) => time.toString().padStart(2, "0");

  return (
    <div className="nes-container with-title is-dark">
      <p className="title">{isBreak ? "Break Time!" : "Focus Mode"}</p>
      <div
        style={{ fontSize: "3.5rem", textAlign: "center", margin: "1rem 0" }}
      >
        {padTime(minutes)}:{padTime(seconds)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <button
          onClick={toggleTimer}
          className={`nes-btn ${isActive ? "is-warning" : "is-primary"}`}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button onClick={resetTimer} className="nes-btn">
          Reset
        </button>
        <button onClick={toggleTimerType} className="nes-btn is-success">
          Switch
        </button>
      </div>
    </div>
  );
}
export default PomodoroWidget;
