
const jwt = require("jsonwebtoken");

const authenticateHR = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "HR authentication required."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "hr" || !decoded.hrId) {
      return res.status(403).json({
        success: false,
        message: "Access denied."
      });
    }

    req.hrId = decoded.hrId;
    req.hrRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired HR session."
    });
  }
};

module.exports = authenticateHR;
