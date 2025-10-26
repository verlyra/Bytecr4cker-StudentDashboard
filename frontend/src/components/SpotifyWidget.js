import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/spotify";

// Komponen untuk kontrol player
const PlayerControls = ({ onAction, isPlaying }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action) => {
    setIsProcessing(true);
    await onAction(action);
    setTimeout(() => setIsProcessing(false), 500);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        marginTop: "1rem",
      }}
    >
      <button
        className="nes-btn"
        onClick={() => handleAction("previous")}
        disabled={isProcessing}
        style={{ fontSize: "0.8rem" }}
      >
        Prev ⏮
      </button>

      <button
        className={`nes-btn ${isPlaying ? "is-warning" : "is-success"}`}
        onClick={() => handleAction(isPlaying ? "pause" : "play")}
        disabled={isProcessing}
        style={{ fontSize: "0.8rem", minWidth: "80px" }}
      >
        {isPlaying ? " Pause ⏸" : " Play ▶"}
      </button>

      <button
        className="nes-btn"
        onClick={() => handleAction("next")}
        disabled={isProcessing}
        style={{ fontSize: "0.8rem" }}
      >
        Next ⏭
      </button>
    </div>
  );
};

// Progress bar untuk durasi lagu
const ProgressBar = ({ progress, duration }) => {
  const percentage = duration > 0 ? (progress / duration) * 100 : 0;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ marginTop: "1rem", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          marginBottom: "0.3rem",
        }}
      >
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <progress
        className="nes-progress is-success"
        value={percentage}
        max="100"
      />
    </div>
  );
};

// Komponen untuk menampilkan UI saat ada lagu yang diputar
const NowPlayingView = ({ data, onPlayerAction }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <img
        src={data.albumArt}
        alt={data.album}
        style={{
          width: "80px",
          height: "80px",
          imageRendering: "pixelated",
          border: "4px solid white",
        }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#92cc41" }}>
          {data.song}
        </p>
        <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.7rem" }}>
          {data.artist}
        </p>
        <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.6rem", opacity: 0.7 }}>
          {data.album}
        </p>
      </div>
    </div>

    {data.progress_ms !== undefined && data.duration_ms && (
      <ProgressBar progress={data.progress_ms} duration={data.duration_ms} />
    )}

    <PlayerControls onAction={onPlayerAction} isPlaying={data.isPlaying} />
  </div>
);

// Komponen untuk menampilkan UI saat tidak ada lagu yang diputar
const NothingPlayingView = ({ onPlayerAction }) => (
  <div style={{ textAlign: "center" }}>
    <i className="nes-icon spotify is-large"></i>
    <p>Nothing is playing...</p>
    <button
      className="nes-btn is-success"
      onClick={() => onPlayerAction("play")}
      style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}
    >
      ▶️ Resume Last Track
    </button>
  </div>
);

// Komponen untuk menampilkan UI saat Spotify belum terhubung
const ConnectView = () => {
  const token = localStorage.getItem("token");
  const loginUrl = `${API_URL}/login?token=${token}`;

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <p>Connect your Spotify account to control playback!</p>
      <a href={loginUrl} className="nes-btn is-success">
        Connect Spotify
      </a>
    </div>
  );
};

function SpotifyWidget() {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isPremium, setIsPremium] = useState(true); // Assume premium by default

  // Fungsi untuk menampilkan notifikasi
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fungsi untuk kontrol player
  const handlePlayerAction = async (action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/player/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh data setelah aksi
      setTimeout(() => fetchNowPlaying(), 500);

      const actionMessages = {
        play: "▶️ Playing",
        pause: "⏸️ Paused",
        next: "⏭️ Next track",
        previous: "⏮️ Previous track",
      };

      showNotification(actionMessages[action] || "Action completed");
    } catch (err) {
      console.error(`Error ${action}:`, err);
      console.error("Full error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      // Error handling lebih detail
      let errorMessage = "Action failed!";

      if (err.response) {
        const status = err.response.status;
        const serverMsg = err.response.data?.msg;
        const serverError = err.response.data?.error;
        const reason = err.response.data?.reason;

        // Detect premium required
        if (
          status === 403 &&
          (reason === "PREMIUM_REQUIRED" || serverError?.includes("Premium"))
        ) {
          setIsPremium(false);
          errorMessage =
            "🎵 Spotify Premium required for playback control. Upgrade at spotify.com/premium";
        } else if (status === 404) {
          errorMessage =
            serverMsg ||
            "❌ No active Spotify device found! Open Spotify on your device first.";
        } else if (status === 403) {
          errorMessage =
            serverMsg || "❌ Premium account required for this action.";
        } else if (status === 401) {
          errorMessage =
            serverMsg || "❌ Session expired. Please reconnect Spotify.";
        } else if (status === 500) {
          errorMessage = `❌ Server error: ${
            serverError || serverMsg || "Unknown error"
          }`;
        } else {
          errorMessage = serverMsg || "Action failed. Try again!";
        }
      } else if (err.request) {
        errorMessage = "❌ Cannot reach server. Check your connection.";
      }

      showNotification(errorMessage, "error");
    }
  };

  // Fungsi untuk mengambil data dari backend
  const fetchNowPlaying = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/now-playing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNowPlaying(response.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("NOT_LINKED");
      } else if (err.response && err.response.status === 401) {
        setError("UNAUTHORIZED");
      } else {
        setError("FETCH_ERROR");
      }
      setNowPlaying(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNowPlaying();
    const intervalId = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Fungsi untuk merender konten berdasarkan state
  const renderContent = () => {
    if (isLoading) {
      return <p>Loading 8-bit beats...</p>;
    }
    if (error === "NOT_LINKED") {
      return <ConnectView />;
    }
    if (error) {
      return <p>Error loading data...</p>;
    }
    if (nowPlaying && nowPlaying.isPlaying) {
      return (
        <NowPlayingView data={nowPlaying} onPlayerAction={handlePlayerAction} />
      );
    }
    return <NothingPlayingView onPlayerAction={handlePlayerAction} />;
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Notifikasi */}
      {notification && (
        <div
          className={`nes-container ${
            notification.type === "error" ? "is-error" : "is-success"
          }`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "0.5rem 1rem",
            minWidth: "200px",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8rem" }}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Widget utama */}
      <div className="nes-container with-title is-dark">
        <p className="title">8-Bit Beat Tracker</p>
        {renderContent()}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default SpotifyWidget;
