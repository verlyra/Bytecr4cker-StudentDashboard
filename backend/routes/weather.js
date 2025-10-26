const router = require("express").Router();
const axios = require("axios");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const city = req.query.city || "Jakarta";
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

module.exports = router;
