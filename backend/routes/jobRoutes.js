
const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

// GET all open jobs
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      location = "",
      employment_type = "",
      entity_id = ""
    } = req.query;

    let conditions = ["j.status = 'Open'"];
    let params = [];

    if (search.trim()) {
      conditions.push(
        "(j.job_title LIKE ? OR j.department LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)"
      );

      const value = `%${search.trim()}%`;
      params.push(value, value, value, value);
    }

    if (location.trim()) {
      conditions.push("j.location LIKE ?");
      params.push(`%${location.trim()}%`);
    }

    if (employment_type.trim()) {
      conditions.push("j.employment_type = ?");
      params.push(employment_type.trim());
    }

    if (entity_id.trim()) {
      conditions.push("j.entity_id = ?");
      params.push(entity_id.trim());
    }

    const [jobs] = await pool.query(
      `
      SELECT
        j.job_id,
        j.job_title,
        j.department,
        j.location,
        j.employment_type,
        j.description,
        j.requirements,
        j.posted_at,
        e.entity_id,
        e.entity_code,
        e.entity_name
      FROM jobs j
      LEFT JOIN entities e
        ON j.entity_id = e.entity_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY j.posted_at DESC
      `,
      params
    );

    res.status(200).json({
      success: true,
      total: jobs.length,
      jobs
    });

  } catch (error) {
    console.error("Fetch Jobs Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch job opportunities."
    });
  }
});

// GET one job by ID
router.get("/:id", async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `
      SELECT
        j.job_id,
        j.job_title,
        j.department,
        j.location,
        j.employment_type,
        j.description,
        j.requirements,
        j.posted_at,
        e.entity_id,
        e.entity_code,
        e.entity_name
      FROM jobs j
      LEFT JOIN entities e
        ON j.entity_id = e.entity_id
      WHERE j.job_id = ?
        AND j.status = 'Open'
      `,
      [req.params.id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job opportunity not found."
      });
    }

    res.status(200).json({
      success: true,
      job: jobs[0]
    });

  } catch (error) {
    console.error("Fetch Job Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch job details."
    });
  }
});

module.exports = router;
