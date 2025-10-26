const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  let token = null;

  if (req.header("Authorization")) {
    token = req.header("Authorization").replace("Bearer ", "");
  }

  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authenticate;
