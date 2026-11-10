
const express = require("express");
const { pool } = require("../config/db");
const authenticateHR = require("../middleware/hrAuthMiddleware");

const router = express.Router();

router.get("/stats", authenticateHR, async (req, res) => {
  try {
    const [[candidateCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM candidates"
    );

    const [[applicationCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM applications"
    );

    const [[openPositionCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM jobs WHERE status = 'Open'"
    );

    const [[shortlistedCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM applications WHERE application_status = 'Shortlisted'"
    );

    res.status(200).json({
      success: true,
      stats: {
        totalCandidates: candidateCount.total,
        totalApplications: applicationCount.total,
        openPositions: openPositionCount.total,
        shortlisted: shortlistedCount.total
      }
    });
  } catch (error) {
    console.error("HR Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics."
    });
  }
});

module.exports = router;
