<!-- HEADER -->
<h1 align="center">💾 Bytecr4cker Dashboard</h1>
<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /></a>
  <a href="https://nostalgic-css.github.io/NES.css/"><img src="https://img.shields.io/badge/NES.css-pixel%20UI-FF6F61?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTE5IDdoLTJWNWgtMXYySDhsMCA1SDdWMTdoMXYyaDF2LTJoMVYxOGgtMXYtMmgxVjE2aDFWN2gyaDFWNnYxaDF2MWgxdi0xaDFWNmgxVjdoMXYxSDE5Wk0xNiAxNGgtNXYtNWg1VjE0WiIvPjwvc3ZnPg==" /></a>
  <a href="https://developer.spotify.com/documentation/web-api/"><img src="https://img.shields.io/badge/Spotify-API-1DB954?style=for-the-badge&logo=spotify&logoColor=white" /></a>
  <a href="https://openweathermap.org/api"><img src="https://img.shields.io/badge/OpenWeather-API-FF8C00?style=for-the-badge&logo=icloud&logoColor=white" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" /></a>
</p>

> _A pixel-styled productivity dashboard — where cyberpunk nights meet study quests._

**Bytecr4cker** is a retro-inspired **student productivity dashboard** that fuses 8-bit aesthetics, CTF hacker spirit, and cozy study vibes.  
It integrates weather, focus timer, calendar, notes, and Spotify — all in a single pixel-art interface.

---

## 🧩 Core Features

### 🌦️ Weather Oracle  
Displays live weather data using **OpenWeatherMap API**.  
Styled in a minimal NES window with pixel fonts and crisp edge rendering.

### 📅 Quest Calendar  
A “mission board” to manage your schedule & deadlines by date.  
There is full integration between the Quest Log and the calendar—any deadlines added to the Quest Log are visually marked on the calendar for clear tracking and synchronization.

### ⏱️ Focus Mode (Pomodoro)  
Retro pixel timer for deep work sessions.  
Start, reset, and switch focus modes in true 8-bit style.

### 🎧 8-Bit Beat Tracker  
Integrated with **Spotify API**, this section shows your currently playing track with album art.  
Each playback button (Prev / Pause / Next) is styled like old-school game controls.

### 🗒️ Quest Log + Field Notes  
Create and manage your tasks, notes, and deadlines.  
Includes scrollbars with pixel shading and hover “blink” animation for that retro glow.

### 🌐 Hyperlink Portals  
Quick access links to your daily tools:
- 🎓 E-Learning & Student Budi Luhur  
- 🤖 ChatGPT  
- 🎵 Spotify Dashboard  

---

## 🎨 Design System  

**Theme:**  
Dark pixel cyberpunk with CRT-inspired textures.

**Typography:**  
- `Press Start 2P` for authentic retro pixel text  

**Palette:**
- `#212529` — Main background (retro night tone)  
- `#343a40` — Widget contrast layer  
- `#e76e55` — NES red (highlight + scrollbar thumb)  
- `#ff9671` — Warm retro hover color  
- `#ffbfa3` — Soft pixel glow border  
- `#ffffff` — Foreground text  

**Visual Touches:**
- Fixed background with parallax pixel city  
- Crisp-edged rendering for all elements  
- Custom scrollbar styled like retro UI  
- Blink animation on hover for lists  
- NES-style container shadows and borders  

---

## ⚙️ Tech Stack  

| Category | Technology |
|-----------|-------------|
| **Frontend** | React.js, Axios, React Router, NES.css |
| **UI Library** | [NES.css](https://nostalgic-css.github.io/NES.css/) + TailwindCSS |
| **Styling** | Custom pixel CSS (see `App.css`) |
| **APIs** | OpenWeatherMap, Spotify Web API |
| **Database** | MySQL |
| **Backend** | Node.js, Express.js, MySQL2, JSON Web Token (JWT), bcrypt.js, CORS, Dotenv |

---

## 🚀 Getting Started  

### 1️⃣ Clone Repository  
```bash
git clone https://github.com/verlyra/Bytecr4cker-StudentDashboard.git
cd pixel_life_hub
````

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

### 3️⃣ Configure Environment

Create `.env` file and add:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=pixel_life_hub

# Application Configuration
JWT_SECRET=CREATE_A_VERY_STRONG_SECRET_KEY
PORT=5000

# Third-Party API Keys
OPENWEATHER_API_KEY=YOUR_OPENWEATHERMAP_API_KEY
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID_FROM_SPOTIFY_DEVELOPER_DASHBOARD
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET_FROM_SPOTIFY_DEVELOPER_DASHBOARD

# Redirect URIs
# Make sure these URIs MATCH EXACTLY with the ones registered in your Spotify Developer Dashboard
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5000/api/spotify/callback
FRONTEND_URI=http://localhost:3000

```

### 4️⃣ Setup Frontend

```bash
cd ../frontend
npm imstall
```
### 5️⃣ Run Development Server

Terminal 1
```bash
cd ../backend
npm run dev
```

Terminal 2
```bash
cd ../frontend
npm start
```
---

## 🕹️ CSS Magic (from `frontend/src/App.css`)

* **Pixel-accurate rendering** using:

  ```css
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  ```
* **Retro scrollbars** with NES red thumb (`#e76e55`)
* **Blink animation** on hover lists using `@keyframes pixelBlink`
* **Custom footer box-shadow** mimicking inset CRT borders

> Every detail is crafted to keep that “authentic 8-bit” mood alive.

---

## ✨ Concept Keywords

`#pixelart` `#retro-ui` `#nes.css` `#spotifyapi` `#cyberstudy` `#8bitdashboard`

---

## 🩷 Author

Built with love, caffeine, and pixels by **@verlyra**

> “Hack your routine, in pixel mode.” 

---

```

