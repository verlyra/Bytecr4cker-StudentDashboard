import React, { useState, useEffect } from "react";
import axios from "axios";

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/weather", {
          params: { city: "Jakarta" },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setWeather(res.data);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (main) => {
    const iconStyle = {
      fontSize: "3rem",
      lineHeight: "1",
      imageRendering: "pixelated",
    };

    switch (main) {
      case "Clear":
        return <span style={iconStyle}>☀️</span>;
      case "Clouds":
        return <span style={iconStyle}>☁️</span>;
      case "Rain":
        return <span style={iconStyle}>🌧️</span>;
      case "Drizzle":
        return <span style={iconStyle}>🌦️</span>;
      case "Thunderstorm":
        return <span style={iconStyle}>⛈️</span>;
      case "Snow":
        return <span style={iconStyle}>❄️</span>;
      case "Mist":
      case "Fog":
        return <span style={iconStyle}>🌫️</span>;
      default:
        return <span style={iconStyle}>🌤️</span>;
    }
  };

  const capitalizeDescription = (desc) => {
    if (!desc) return "";
    return desc
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const widgetStyles = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  const detailsContainerStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  };

  return (
    <div className="nes-container with-title is-dark">
      <p className="title">Weather Oracle</p>
      {loading ? (
        <p>Loading forecast...</p>
      ) : weather ? (
        <div style={widgetStyles}>
          <div>{getWeatherIcon(weather.weather[0].main)}</div>
          <div style={detailsContainerStyles}>
            <p className="nes-text is-primary" style={{ marginBottom: "8px" }}>
              {weather.name}
            </p>
            <h2 style={{ fontSize: "2.5rem", margin: "0" }}>
              {Math.round(weather.main.temp)}°C
            </h2>
            <p className="nes-text is-disabled" style={{ marginTop: "8px" }}>
              {capitalizeDescription(weather.weather[0].description)}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>❌</span>
          <p>Could not load weather.</p>
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;
