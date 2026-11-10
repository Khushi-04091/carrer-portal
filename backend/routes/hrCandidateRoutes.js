
const express = require("express");
const path = require("path");
const fs = require("fs");
const { pool } = require("../config/db");
const authenticateHR = require("../middleware/hrAuthMiddleware");

const router = express.Router();

// ==========================================
// GET ALL CANDIDATES WITH PROFILE INFORMATION
// GET /api/hr/candidates
// ==========================================

router.get("/", authenticateHR, async (req, res) => {
  try {
    const {
      search = "",
      location = "",
      qualification = "",
      stream = ""
    } = req.query;

    const conditions = [];
    const params = [];

    // Search by name, email or phone
    if (search.trim()) {
      conditions.push(`
        (
          c.full_name LIKE ?
          OR c.email LIKE ?
          OR c.phone LIKE ?
        )
      `);

      const searchValue = `%${search.trim()}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Filter by preferred location
    if (location.trim()) {
      conditions.push(
        "cp.preferred_location LIKE ?"
      );

      params.push(`%${location.trim()}%`);
    }

    // Filter by qualification
    if (qualification.trim()) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM candidate_education ce
          WHERE ce.candidate_id = c.candidate_id
          AND ce.qualification_level = ?
        )
      `);

      params.push(qualification.trim());
    }

    // Filter by degree or stream
    if (stream.trim()) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM candidate_education ce
          WHERE ce.candidate_id = c.candidate_id
          AND ce.degree_or_stream LIKE ?
        )
      `);

      params.push(`%${stream.trim()}%`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Fetch candidate information
    const [candidates] = await pool.query(
      `
      SELECT
        c.candidate_id,
        c.full_name,
        c.email,
        c.phone,
        c.education,
        c.experience,
        c.profile_status,
        c.profile_submitted_at,
        c.resume_path,

        p.date_of_birth,
        p.gender,
        p.current_address,
        p.current_city,
        p.current_state,
        p.current_pincode,
        p.permanent_address,
        p.permanent_city,
        p.permanent_state,
        p.permanent_pincode,
        p.experience_type,

        cp.preferred_location,
        cp.preferred_department,
        cp.hiring_category,
        cp.employment_type,
        cp.notice_period,
        cp.expected_salary,
        cp.willing_to_relocate,

        e.entity_id,
        e.entity_code,
        e.entity_name

      FROM candidates c

      LEFT JOIN candidate_profiles p
        ON c.candidate_id = p.candidate_id

      LEFT JOIN candidate_preferences cp
        ON c.candidate_id = cp.candidate_id

      LEFT JOIN entities e
        ON cp.preferred_entity_id = e.entity_id

      ${whereClause}

      ORDER BY c.created_at DESC
      `,
      params
    );

    // Fetch education and experience records
    const candidateDetails = await Promise.all(
      candidates.map(async (candidate) => {
        const candidateId = candidate.candidate_id;

        const [education] = await pool.query(
          `
          SELECT
            education_id,
            qualification_level,
            institution_name,
            board_or_university,
            degree_or_stream,
            roll_number,
            passing_year,
            percentage,
            cgpa
          FROM candidate_education
          WHERE candidate_id = ?
          ORDER BY passing_year DESC
          `,
          [candidateId]
        );

        const [experience] = await pool.query(
          `
          SELECT
            experience_id,
            organisation_name,
            job_title,
            employment_type,
            start_date,
            end_date,
            currently_working,
            description
          FROM candidate_experience
          WHERE candidate_id = ?
          ORDER BY start_date DESC
          `,
          [candidateId]
        );

        return {
          ...candidate,

          // Only return whether a resume exists.
          // Never expose its private server path.
          hasResume: Boolean(candidate.resume_path),

          resume_path: undefined,

          education,
          experience
        };
      })
    );

    return res.status(200).json({
      success: true,
      total: candidateDetails.length,
      candidates: candidateDetails
    });

  } catch (error) {
    console.error("HR Candidate Fetch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch candidate information."
    });
  }
});

// ==========================================
// HR: SECURE CANDIDATE RESUME VIEW / DOWNLOAD
// GET /api/hr/candidates/:candidateId/resume
// ==========================================

router.get(
  "/:candidateId/resume",
  authenticateHR,
  async (req, res) => {
    try {
      const candidateId = Number(req.params.candidateId);

      // Validate candidate ID
      if (
        !Number.isInteger(candidateId) ||
        candidateId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid candidate ID."
        });
      }

      // Get resume path from MySQL
      const [rows] = await pool.execute(
        `
        SELECT resume_path
        FROM candidates
        WHERE candidate_id = ?
        LIMIT 1
        `,
        [candidateId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found."
        });
      }

      if (!rows[0].resume_path) {
        return res.status(404).json({
          success: false,
          message: "This candidate has not uploaded a resume."
        });
      }

      // Private resume directory
      const resumeDirectory = path.resolve(
        __dirname,
        "..",
        "uploads",
        "resumes"
      );

      // Extract only the filename from the database path
      const fileName = path.basename(
        rows[0].resume_path
      );

      // Validate filename and PDF extension
      if (
        !fileName.startsWith(`candidate-${candidateId}-`) ||
        path.extname(fileName).toLowerCase() !== ".pdf"
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid resume file."
        });
      }

      const filePath = path.resolve(
        resumeDirectory,
        fileName
      );

      // Prevent directory traversal
      if (
        path.dirname(filePath) !== resumeDirectory
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied."
        });
      }

      // Check whether the resume exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Resume file is missing from storage."
        });
      }

      // Verify that it is a file
      if (!fs.statSync(filePath).isFile()) {
        return res.status(400).json({
          success: false,
          message: "Invalid resume file."
        });
      }

      // Security headers
      res.setHeader(
        "Cache-Control",
        "private, no-store"
      );

      res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
      );

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      const downloadName =
        `Drishtee_Candidate_${candidateId}_Resume.pdf`;

      // ======================================
      // VIEW RESUME IN BROWSER
      // URL: ?action=view
      // ======================================

      if (req.query.action === "view") {
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${downloadName}"`
        );

        return res.sendFile(
          filePath,
          (error) => {
            if (error) {
              console.error(
                "HR Resume View Error:",
                error
              );

              if (!res.headersSent) {
                res.status(500).json({
                  success: false,
                  message: "Unable to open candidate resume."
                });
              }
            }
          }
        );
      }

      // ======================================
      // DOWNLOAD RESUME
      // ======================================

      return res.download(
        filePath,
        downloadName,
        (error) => {
          if (error) {
            console.error(
              "HR Resume Download Error:",
              error
            );

            if (!res.headersSent) {
              res.status(500).json({
                success: false,
                message: "Unable to download candidate resume."
              });
            }
          }
        }
      );

    } catch (error) {
      console.error(
        "HR Resume Route Error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Unable to access candidate resume."
        });
      }
    }
  }
);

module.exports = router;
