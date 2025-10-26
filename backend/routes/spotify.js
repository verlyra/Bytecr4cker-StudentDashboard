const router = require("express").Router();
const axios = require("axios");
const querystring = require("querystring");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

// Helper function untuk membuat string acak (untuk keamanan 'state')
const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";
const userIdKey = "spotify_user_id";

/**
 * @route   GET /api/spotify/login
 * @desc    Mengarahkan pengguna ke halaman otorisasi Spotify
 * @access  Private
 */
router.get("/login", authMiddleware, (req, res) => {
  const state = generateRandomString(16);

  // Simpan state dan user_id di cookie untuk verifikasi nanti
  res.cookie(stateKey, state, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 menit
    sameSite: "lax",
  });

  res.cookie(userIdKey, req.user.id, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 menit
    sameSite: "lax",
  });

  // Scope: Izin yang kita minta dari pengguna (tambahkan kontrol player)
  const scope =
    "user-read-currently-playing user-read-playback-state user-modify-playback-state";

  // Redirect ke halaman otorisasi Spotify
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: state,
      })
  );
});

/**
 * @route   GET /api/spotify/callback
 * @desc    Endpoint yang dipanggil Spotify setelah pengguna memberikan izin
 * @access  Public (dilindungi dengan state validation)
 */
router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;
  const userId = req.cookies ? req.cookies[userIdKey] : null;

  // Verifikasi 'state' untuk mencegah serangan CSRF
  if (state === null || state !== storedState) {
    res.clearCookie(stateKey);
    res.clearCookie(userIdKey);
    return res.redirect(
      process.env.FRONTEND_URI +
        "/#" +
        querystring.stringify({ error: "state_mismatch" })
    );
  }

  // Verifikasi user_id
  if (!userId) {
    res.clearCookie(stateKey);
    res.clearCookie(userIdKey);
    return res.redirect(
      process.env.FRONTEND_URI +
        "/#" +
        querystring.stringify({ error: "no_user_session" })
    );
  }

  // Clear cookies setelah verifikasi
  res.clearCookie(stateKey);
  res.clearCookie(userIdKey);

  try {
    // Menukarkan 'authorization code' dengan 'access token'
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: querystring.stringify({
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;
    const expires_at_date = new Date(Date.now() + expires_in * 1000);
    const expires_at = expires_at_date
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Simpan token ke database. Jika user sudah ada, update tokennya.
    await db.query(
      `INSERT INTO spotify_tokens (user_id, access_token, refresh_token, expires_at)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             access_token = VALUES(access_token),
             refresh_token = VALUES(refresh_token),
             expires_at = VALUES(expires_at)`,
      [userId, access_token, refresh_token, expires_at]
    );

    // Arahkan kembali ke halaman dashboard di frontend
    res.redirect(process.env.FRONTEND_URI + "?spotify_connected=true");
  } catch (error) {
    console.error(
      "Error getting Spotify token:",
      error.response ? error.response.data : error.message
    );
    res.redirect(
      process.env.FRONTEND_URI +
        "/#" +
        querystring.stringify({ error: "invalid_token" })
    );
  }
});

/**
 * @route   GET /api/spotify/now-playing
 * @desc    Mengambil lagu yang sedang diputar oleh pengguna
 * @access  Private
 */
router.get("/now-playing", authMiddleware, async (req, res) => {
  try {
    console.log(`[NOW-PLAYING] User ${req.user.id} requesting now playing...`);

    const [tokenRows] = await db.query(
      "SELECT * FROM spotify_tokens WHERE user_id = ?",
      [req.user.id]
    );

    if (tokenRows.length === 0) {
      console.log(`[NOW-PLAYING] Spotify not linked for user ${req.user.id}`);
      return res.status(404).json({ msg: "Spotify not linked" });
    }

    console.log(`[NOW-PLAYING] Token found, fetching from Spotify API...`);

    const accessToken = tokenRows[0].access_token;
    const spotifyResponse = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    // Spotify akan mengembalikan status 204 jika tidak ada lagu yang diputar
    if (spotifyResponse.status === 204 || !spotifyResponse.data) {
      console.log(
        `[NOW-PLAYING] No song currently playing for user ${req.user.id}`
      );
      return res.json({ isPlaying: false });
    }

    const { item, is_playing, progress_ms } = spotifyResponse.data;

    console.log(`[NOW-PLAYING] Found: ${item.name} by ${item.artists[0].name}`);

    res.json({
      isPlaying: is_playing,
      song: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
      album: item.album.name,
      albumArt: item.album.images[0]?.url,
      progress_ms: progress_ms,
      duration_ms: item.duration_ms,
    });
  } catch (error) {
    console.error("=== ERROR FETCHING NOW PLAYING ===");
    console.error("User ID:", req.user.id);
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    console.error("Status:", error.response?.status);
    console.error("==================================");

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      return res
        .status(404)
        .json({ msg: "Spotify not linked or token invalid" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * Helper function untuk mendapatkan access token user
 * Dengan auto-refresh jika expired
 */
const getAccessToken = async (userId) => {
  const [tokenRows] = await db.query(
    "SELECT * FROM spotify_tokens WHERE user_id = ?",
    [userId]
  );

  if (tokenRows.length === 0) {
    throw new Error("Spotify not linked");
  }

  const tokenData = tokenRows[0];
  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();

  // Jika token masih valid (belum expired), return langsung
  if (expiresAt > now) {
    return tokenData.access_token;
  }

  // Token expired, refresh token
  console.log("Access token expired, refreshing...");

  try {
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token,
      }),
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, expires_in } = response.data;
    const expires_at_date = new Date(Date.now() + expires_in * 1000);
    const expires_at = expires_at_date
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Update token di database
    await db.query(
      "UPDATE spotify_tokens SET access_token = ?, expires_at = ? WHERE user_id = ?",
      [access_token, expires_at, userId]
    );

    console.log("Access token refreshed successfully");
    return access_token;
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh Spotify token");
  }
};

/**
 * @route   POST /api/spotify/player/play
 * @desc    Mulai atau lanjutkan pemutaran
 * @access  Private
 */
router.post("/player/play", authMiddleware, async (req, res) => {
  try {
    console.log(`[PLAY] User ${req.user.id} attempting to play...`);

    const accessToken = await getAccessToken(req.user.id);
    console.log(
      `[PLAY] Access token retrieved: ${accessToken.substring(0, 10)}...`
    );

    await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      {},
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    console.log(`[PLAY] Playback started successfully`);
    res.json({ msg: "Playback started" });
  } catch (error) {
    console.error("=== ERROR STARTING PLAYBACK ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      console.error("No response received");
    } else {
      console.error("Error details:", error);
    }
    console.error("=================================");

    if (error.message === "Spotify not linked") {
      return res.status(404).json({ msg: error.message });
    }

    if (error.message === "Failed to refresh Spotify token") {
      return res
        .status(401)
        .json({ msg: "Token refresh failed. Please reconnect Spotify." });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        msg: "No active device found. Please open Spotify on a device.",
      });
    }

    if (error.response?.status === 403) {
      return res
        .status(403)
        .json({ msg: "Premium account required or insufficient permissions." });
    }

    // Return detailed error untuk debugging
    res.status(500).json({
      msg: "Failed to start playback",
      error: error.response?.data?.error?.message || error.message,
      reason: error.response?.data?.error?.reason || "unknown",
    });
  }
});

/**
 * @route   POST /api/spotify/player/pause
 * @desc    Jeda pemutaran
 * @access  Private
 */
router.post("/player/pause", authMiddleware, async (req, res) => {
  try {
    console.log(`[PAUSE] User ${req.user.id} attempting to pause...`);

    const accessToken = await getAccessToken(req.user.id);

    await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      {},
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    console.log(`[PAUSE] Playback paused successfully`);
    res.json({ msg: "Playback paused" });
  } catch (error) {
    console.error("=== ERROR PAUSING PLAYBACK ===");
    console.error("Error:", error.response?.data || error.message);
    console.error("==============================");

    if (error.message === "Spotify not linked") {
      return res.status(404).json({ msg: error.message });
    }

    if (error.message === "Failed to refresh Spotify token") {
      return res
        .status(401)
        .json({ msg: "Token refresh failed. Please reconnect Spotify." });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ msg: "No active device found." });
    }

    res.status(500).json({
      msg: "Failed to pause playback",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * @route   POST /api/spotify/player/next
 * @desc    Skip ke lagu berikutnya
 * @access  Private
 */
router.post("/player/next", authMiddleware, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.user.id);

    await axios.post(
      "https://api.spotify.com/v1/me/player/next",
      {},
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    res.json({ msg: "Skipped to next track" });
  } catch (error) {
    console.error(
      "Error skipping to next:",
      error.response?.data || error.message
    );

    if (error.message === "Spotify not linked") {
      return res.status(404).json({ msg: error.message });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        msg: "No active device found. Please open Spotify on a device.",
      });
    }

    res.status(500).json({ msg: "Failed to skip track" });
  }
});

/**
 * @route   POST /api/spotify/player/previous
 * @desc    Kembali ke lagu sebelumnya
 * @access  Private
 */
router.post("/player/previous", authMiddleware, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.user.id);

    await axios.post(
      "https://api.spotify.com/v1/me/player/previous",
      {},
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    res.json({ msg: "Skipped to previous track" });
  } catch (error) {
    console.error(
      "Error skipping to previous:",
      error.response?.data || error.message
    );

    if (error.message === "Spotify not linked") {
      return res.status(404).json({ msg: error.message });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        msg: "No active device found. Please open Spotify on a device.",
      });
    }

    res.status(500).json({ msg: "Failed to skip track" });
  }
});

/**
 * @route   POST /api/spotify/player/volume
 * @desc    Atur volume (0-100)
 * @access  Private
 */
router.post("/player/volume", authMiddleware, async (req, res) => {
  try {
    const { volume } = req.body;

    if (volume === undefined || volume < 0 || volume > 100) {
      return res.status(400).json({ msg: "Volume must be between 0 and 100" });
    }

    const accessToken = await getAccessToken(req.user.id);

    await axios.put(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`,
      {},
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    res.json({ msg: `Volume set to ${volume}%` });
  } catch (error) {
    console.error(
      "Error setting volume:",
      error.response?.data || error.message
    );

    if (error.message === "Spotify not linked") {
      return res.status(404).json({ msg: error.message });
    }

    res.status(500).json({ msg: "Failed to set volume" });
  }
});

/**
 * @route   GET /api/spotify/devices
 * @desc    Dapatkan daftar device yang tersedia
 * @access  Private
 */
router.get("/devices", authMiddleware, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.user.id);

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    res.json({ devices: response.data.devices });
  } catch (error) {
    console.error(
      "Error fetching devices:",
      error.response?.data || error.message
    );

    if (error.message === "Spotify not linked") {
      return res.status(404).json({ msg: error.message });
    }

    res.status(500).json({ msg: "Failed to fetch devices" });
  }
});

module.exports = router;
