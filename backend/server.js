
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB, pool } = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const loginRoutes = require("./routes/loginRoutes");
const profileRoutes = require("./routes/profileRoutes");
const hrAuthRoutes = require("./routes/hrAuthRoutes");
const hrDashboardRoutes = require("./routes/hrDashboardRoutes");
const hrCandidateRoutes = require("./routes/hrCandidateRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://carrer-portal-liard.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked this origin: ${origin}`)
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// =====================================
// GENERAL MIDDLEWARE
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// HOME / HEALTH CHECK API
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Drishtee Careers API is running!",
    status: "OK"
  });
});

// =====================================
// AUTHENTICATION ROUTES
// =====================================

app.use("/api/auth", authRoutes);
app.use("/api/auth", loginRoutes);

// =====================================
// JOB ROUTES
// =====================================

app.use("/api/jobs", jobRoutes);

// =====================================
// CANDIDATE PROFILE ROUTES
// =====================================

app.use("/api/profile", profileRoutes);

// =====================================
// HR ROUTES
// =====================================

app.use("/api/hr/auth", hrAuthRoutes);
app.use("/api/hr/dashboard", hrDashboardRoutes);
app.use("/api/hr/candidates", hrCandidateRoutes);

// =====================================
// GET ALL DRISHTEE ENTITIES
// =====================================

app.get("/api/entities", async (req, res) => {
  try {
    const [entities] = await pool.query(
      "SELECT * FROM entities ORDER BY entity_id ASC"
    );

    res.status(200).json({
      success: true,
      data: entities
    });

  } catch (error) {
    console.error("Entities API Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch entities."
    });
  }
});

// =====================================
// HANDLE UNKNOWN API ROUTES
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  if (error.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Request blocked by CORS policy."
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// =====================================
// START SERVER AFTER DATABASE CONNECTION
// =====================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("----------------------------------");
      console.log("DRISHTEE CAREERS BACKEND");
      console.log("----------------------------------");
      console.log(`Server running on port ${PORT}`);
      console.log("MySQL Database Connected Successfully!");
      console.log("Allowed frontend origins:");

      allowedOrigins.forEach((origin) => {
        console.log(`- ${origin}`);
      });

      console.log("----------------------------------");
    });

  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
