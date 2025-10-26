import React from "react";

function CalendarWidget({ tasks, currentDate, onPrevMonth, onNextMonth }) {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDeadlineStatus = (date) => {
    if (!date) return "none";

    const calendarDateString = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const deadlines = tasks.filter((task) => {
      if (!task.due_date) return false;

      const taskDate = new Date(task.due_date);
      const localDateString = `${taskDate.getFullYear()}-${String(
        taskDate.getMonth() + 1
      ).padStart(2, "0")}-${String(taskDate.getDate()).padStart(2, "0")}`;

      return localDateString === calendarDateString;
    });

    if (deadlines.length === 0) return "none";
    if (deadlines.every((task) => task.is_completed)) return "completed";
    return "pending";
  };

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

  const days = getDaysInMonth(currentDate);

  return (
    <div
      className="nes-container with-title is-dark"
      style={{ minHeight: "300px" }}
    >
      <p className="title">Quest Calendar</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button onClick={onPrevMonth} className="nes-btn">
          {"<"}
        </button>
        <span>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={onNextMonth} className="nes-btn">
          {">"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "5px",
          fontSize: "0.8rem",
          textAlign: "center",
        }}
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} style={{ color: "#92cc41", fontWeight: "bold" }}>
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const status = getDeadlineStatus(date);
          let borderColor = "transparent";
          if (status === "pending") borderColor = "#e76e55";
          if (status === "completed") borderColor = "#92cc41";

          return (
            <div
              key={index}
              style={{
                padding: "5px",
                minHeight: "30px",
                backgroundColor: isToday(date) ? "#209cee" : "transparent",
                color: isToday(date) ? "#fff" : "inherit",
                border: `2px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {date ? date.getDate() : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarWidget;
