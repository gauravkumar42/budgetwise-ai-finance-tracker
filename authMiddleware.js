// authMiddleware.js
// Protects routes by verifying the Bearer JWT
// and attaching the authenticated user to req.user.

const jwt = require("jsonwebtoken");
const User = require("./User");

const protect = async (req, res, next) => {
  let token;

  // Expect:
  // Authorization: Bearer <JWT_TOKEN>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      message: "Not authorised — no token provided",
    });
  }

  try {
    // Verify JWT using the secret from .env
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the user associated with the token
    // and exclude the password
    req.user = await User.findById(decoded.id).select("-password");

    // User doesn't exist anymore
    if (!req.user) {
      return res.status(401).json({
        message: "User belonging to this token no longer exists",
      });
    }

    // Authentication successful
    next();

  } catch (err) {
    console.error("Authentication error:", err.message);

    const message =
      err.name === "TokenExpiredError"
        ? "Token expired — please log in again"
        : "Invalid token — please log in again";

    return res.status(401).json({
      message,
    });
  }
};

module.exports = { protect };