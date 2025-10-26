import React from "react";

function ShortcutsWidget() {
  return (
    <div className="nes-container with-title is-dark">
      <p className="title">Hyperlink Portals</p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem",
          justifyContent: "center",
        }}
      >
        <a
          href="https://elearning.budiluhur.ac.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="nes-btn"
          style={{ flex: "0 1 auto" }}
        >
          E-Learning Budi Luhur
        </a>
        <a
          href="https://chat.openai.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="nes-btn is-primary"
          style={{ flex: "0 1 auto" }}
        >
          ChatGPT
        </a>
        <a
          href="https://student.budiluhur.ac.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="nes-btn"
          style={{ flex: "0 1 auto" }}
        >
          Student Budi Luhur
        </a>
        <a
          href="https://open.spotify.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="nes-btn is-primary"
          style={{ flex: "0 1 auto" }}
        >
          Spotify
        </a>
      </div>
    </div>
  );
}

export default ShortcutsWidget;
