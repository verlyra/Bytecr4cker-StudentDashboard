import React, { useState, useEffect } from "react";

function NotesWidget() {
  // State untuk menyimpan isi dari textarea
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("dashboard-notes");
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-notes", notes);
  }, [notes]);

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  return (
    <div className="nes-container with-title is-dark">
      <p className="title">Field Notes</p>
      <div className="nes-field">
        <textarea
          id="notes_textarea"
          className="nes-textarea is-dark"
          placeholder="Jot down your important quests here..."
          value={notes}
          onChange={handleNotesChange}
          style={{ height: "250px", resize: "vertical" }}
        />
      </div>
    </div>
  );
}

export default NotesWidget;
