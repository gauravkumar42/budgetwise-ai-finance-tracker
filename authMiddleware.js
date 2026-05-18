// backend/middleware/auth.js
// ─────────────────────────────────────────────
// Protects routes by verifying the Bearer JWT in the
// Authorization header and attaching req.user to the request.
// ─────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const User = require("./User");

const protect = async (req, res, next) => {
  let token;

  // JWT is expected as:  Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised — no token provided" });
  }

  try {
    // Verify signature + expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user doc (without the password field) to the request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists" });
    }

    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired — please log in again"
        : "Invalid token — please log in again";

    return res.status(401).json({ message });
  }
};

module.exports = { protect };