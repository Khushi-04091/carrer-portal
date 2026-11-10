
const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const authenticateCandidate = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
// Private resume storage directory
const resumeDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "resumes"
);

// Create directory if it does not exist
fs.mkdirSync(resumeDirectory, { recursive: true });

// Configure resume storage
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `candidate-${req.candidateId}-${crypto.randomUUID()}.pdf`;

    cb(null, uniqueName);
  }
});

// Allow only PDF files, maximum 5 MB
const uploadResume = multer({
  storage: resumeStorage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      extension !== ".pdf" ||
      file.mimetype !== "application/pdf"
    ) {
      return cb(new Error("Only PDF resume files are allowed."));
    }

    cb(null, true);
  }
});

// =====================================
// TEST PROFILE API
// =====================================

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile API is working!"
  });
});

// =====================================
// SAVE OR UPDATE PERSONAL INFORMATION
// =====================================
// =====================================
// GET CANDIDATE PERSONAL INFORMATION
// =====================================

router.get("/personal", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    const [rows] = await pool.execute(
      `SELECT
        c.full_name,
        c.email,
        c.phone,
        DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS date_of_birth,
        p.gender,
        p.current_address,
        p.current_city,
        p.current_state,
        p.current_pincode,
        p.permanent_address,
        p.permanent_city,
        p.permanent_state,
        p.permanent_pincode
      FROM candidates c
      LEFT JOIN candidate_profiles p
        ON c.candidate_id = p.candidate_id
      WHERE c.candidate_id = ?
      LIMIT 1`,
      [candidateId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found."
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("Personal Details Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch personal information."
    });
  }
});

router.post("/personal", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    const {
      full_name,
      date_of_birth,
      gender,
      current_address,
      current_city,
      current_state,
      current_pincode,
      permanent_address,
      permanent_city,
      permanent_state,
      permanent_pincode
    } = req.body;

    if (
      !full_name?.trim() ||
      !date_of_birth ||
      !current_address?.trim() ||
      !current_city?.trim() ||
      !current_state?.trim() ||
      !current_pincode ||
      !permanent_address?.trim() ||
      !permanent_city?.trim() ||
      !permanent_state?.trim() ||
      !permanent_pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });
    }

    const pincodeRegex = /^[0-9]{6}$/;

    if (
      !pincodeRegex.test(current_pincode) ||
      !pincodeRegex.test(permanent_pincode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid 6-digit PIN codes."
      });
    }

    await pool.execute(
      "UPDATE candidates SET full_name = ? WHERE candidate_id = ?",
      [full_name.trim(), candidateId]
    );

    await pool.execute(
      `INSERT INTO candidate_profiles (
        candidate_id,
        date_of_birth,
        gender,
        current_address,
        current_city,
        current_state,
        current_pincode,
        permanent_address,
        permanent_city,
        permanent_state,
        permanent_pincode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        date_of_birth = VALUES(date_of_birth),
        gender = VALUES(gender),
        current_address = VALUES(current_address),
        current_city = VALUES(current_city),
        current_state = VALUES(current_state),
        current_pincode = VALUES(current_pincode),
        permanent_address = VALUES(permanent_address),
        permanent_city = VALUES(permanent_city),
        permanent_state = VALUES(permanent_state),
        permanent_pincode = VALUES(permanent_pincode)`,
      [
        candidateId,
        date_of_birth,
        gender || null,
        current_address.trim(),
        current_city.trim(),
        current_state.trim(),
        current_pincode,
        permanent_address.trim(),
        permanent_city.trim(),
        permanent_state.trim(),
        permanent_pincode
      ]
    );

    res.status(200).json({
      success: true,
      message: "Personal information saved successfully!"
    });

  } catch (error) {
    console.error("Profile Save Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save personal information."
    });
  }
});

// =====================================
// SAVE OR UPDATE EDUCATION DETAILS
// =====================================

router.post("/education", authenticateCandidate, async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const candidateId = req.candidateId;
    const { education } = req.body;

    const allowedQualifications = [
      "Class 10",
      "Class 12",
      "Diploma",
      "Graduation",
      "Post Graduation",
      "Other"
    ];

    // Validate education array
    if (
      !Array.isArray(education) ||
      education.length === 0 ||
      education.length > allowedQualifications.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid education records."
      });
    }

    // Validate every education record
    for (const item of education) {
      if (!item || typeof item !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid education record."
        });
      }

      if (
        !allowedQualifications.includes(item.qualification_level) ||
        !item.institution_name?.trim() ||
        !item.board_or_university?.trim() ||
        !item.degree_or_stream?.trim() ||
        !item.roll_number?.trim() ||
        !item.passing_year
      ) {
        return res.status(400).json({
          success: false,
          message: "Please complete all required education fields."
        });
      }

      const year = Number(item.passing_year);

      if (!Number.isInteger(year) || year < 1950 || year > 2100) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid passing year."
        });
      }

      if (
        item.result_type !== "percentage" &&
        item.result_type !== "cgpa"
      ) {
        return res.status(400).json({
          success: false,
          message: "Please select Percentage or CGPA."
        });
      }

      const percentage =
        item.percentage === "" || item.percentage == null
          ? null
          : Number(item.percentage);

      const cgpa =
        item.cgpa === "" || item.cgpa == null
          ? null
          : Number(item.cgpa);

      if (
        item.result_type === "percentage" &&
        (
          percentage === null ||
          !Number.isFinite(percentage) ||
          percentage < 0 ||
          percentage > 100
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid percentage between 0 and 100."
        });
      }

      if (
        item.result_type === "cgpa" &&
        (
          cgpa === null ||
          !Number.isFinite(cgpa) ||
          cgpa < 0 ||
          cgpa > 10
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid CGPA between 0 and 10."
        });
      }
    }

    // Prevent duplicate qualification levels in one submission
    const levels = education.map(
      item => item.qualification_level
    );

    if (new Set(levels).size !== levels.length) {
      return res.status(400).json({
        success: false,
        message: "Each qualification level can be added only once."
      });
    }

    // Get database connection only after validation
    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    for (const item of education) {
      const percentage =
        item.result_type === "percentage"
          ? Number(item.percentage)
          : null;

      const cgpa =
        item.result_type === "cgpa"
          ? Number(item.cgpa)
          : null;

      // Check whether this candidate already has this qualification
      const [existing] = await connection.execute(
        `SELECT education_id
         FROM candidate_education
         WHERE candidate_id = ?
         AND qualification_level = ?
         LIMIT 1`,
        [candidateId, item.qualification_level]
      );

      if (existing.length > 0) {

        // Update existing qualification
        await connection.execute(
          `UPDATE candidate_education
           SET institution_name = ?,
               board_or_university = ?,
               degree_or_stream = ?,
               roll_number = ?,
               passing_year = ?,
               percentage = ?,
               cgpa = ?
           WHERE education_id = ?
           AND candidate_id = ?`,
          [
            item.institution_name.trim(),
            item.board_or_university.trim(),
            item.degree_or_stream.trim(),
            item.roll_number.trim(),
            item.passing_year,
            percentage,
            cgpa,
            existing[0].education_id,
            candidateId
          ]
        );

      } else {

        // Insert new qualification
        await connection.execute(
          `INSERT INTO candidate_education (
            candidate_id,
            qualification_level,
            institution_name,
            board_or_university,
            degree_or_stream,
            roll_number,
            passing_year,
            percentage,
            cgpa
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            candidateId,
            item.qualification_level,
            item.institution_name.trim(),
            item.board_or_university.trim(),
            item.degree_or_stream.trim(),
            item.roll_number.trim(),
            item.passing_year,
            percentage,
            cgpa
          ]
        );
      }
    }

    await connection.commit();
    transactionStarted = false;

    res.status(200).json({
      success: true,
      message: "Education details saved successfully!"
    });

  } catch (error) {

    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Transaction Rollback Error:", rollbackError);
      }
    }

    console.error("Education Save Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save education details."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// =====================================
// GET CANDIDATE EDUCATION DETAILS
// =====================================

router.get("/education", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    const [education] = await pool.execute(
      `SELECT
        education_id,
        qualification_level,
        institution_name,
        board_or_university,
        degree_or_stream,
        roll_number,
        passing_year,
        percentage,
        cgpa,
        marksheet_path
       FROM candidate_education
       WHERE candidate_id = ?
       ORDER BY education_id ASC`,
      [candidateId]
    );

    res.status(200).json({
      success: true,
      data: education
    });

  } catch (error) {
    console.error("Education Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch education details."
    });
  }
});

// ==========================================
// GET: Fetch candidate experience details
// URL: GET /api/profile/experience
// ==========================================

router.get("/experience", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    const [profileRows] = await pool.execute(
      `SELECT experience_type
       FROM candidate_profiles
       WHERE candidate_id = ?
       LIMIT 1`,
      [candidateId]
    );

    const [experiences] = await pool.execute(
      `SELECT
          experience_id,
          organisation_name,
          job_title,
          employment_type,
          DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
          DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
          currently_working,
          description
       FROM candidate_experience
       WHERE candidate_id = ?
       ORDER BY start_date DESC, experience_id DESC`,
      [candidateId]
    );

    return res.status(200).json({
      success: true,
      experience_type: profileRows[0]?.experience_type || "",
      data: experiences
    });

  } catch (error) {
    console.error("Fetch Experience Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch experience details."
    });
  }
});


// ==========================================
// POST: Save candidate experience details
// URL: POST /api/profile/experience
// ==========================================

router.post("/experience", authenticateCandidate, async (req, res) => {
  let connection;

  try {
    const candidateId = req.candidateId;
    const { experience_type, experiences } = req.body;

    // Validate experience type
    if (!["Fresher", "Experienced"].includes(experience_type)) {
      return res.status(400).json({
        success: false,
        message: "Please select Fresher or Experienced."
      });
    }

    if (!Array.isArray(experiences)) {
      return res.status(400).json({
        success: false,
        message: "Experience details must be provided as a list."
      });
    }

    // Freshers should not submit previous job records
    if (experience_type === "Fresher" && experiences.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A fresher should not have previous work experience records."
      });
    }

    // Experienced candidates must add at least one record
    if (experience_type === "Experienced" && experiences.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one work experience."
      });
    }

    // Validate each experience record
    for (const item of experiences) {
      if (
        !item.organisation_name?.trim() ||
        !item.job_title?.trim() ||
        !item.start_date
      ) {
        return res.status(400).json({
          success: false,
          message: "Company name, job title and start date are required."
        });
      }

      if (
        item.currently_working &&
        item.end_date
      ) {
        return res.status(400).json({
          success: false,
          message: "End date must be empty for a current job."
        });
      }

      if (
        !item.currently_working &&
        !item.end_date
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide the end date for previous employment."
        });
      }

      if (
        item.end_date &&
        item.end_date < item.start_date
      ) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date."
        });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Update candidate's experience type
    await connection.execute(
      `UPDATE candidate_profiles
       SET experience_type = ?
       WHERE candidate_id = ?`,
      [experience_type, candidateId]
    );

    // Replace existing records with the submitted list
    await connection.execute(
      `DELETE FROM candidate_experience
       WHERE candidate_id = ?`,
      [candidateId]
    );

    // Insert all submitted experiences
    for (const item of experiences) {
      await connection.execute(
        `INSERT INTO candidate_experience (
          candidate_id,
          organisation_name,
          job_title,
          employment_type,
          start_date,
          end_date,
          currently_working,
          description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          candidateId,
          item.organisation_name.trim(),
          item.job_title.trim(),
          item.employment_type || "Full-time",
          item.start_date,
          item.currently_working ? null : item.end_date,
          item.currently_working ? 1 : 0,
          item.description?.trim() || null
        ]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Experience details saved successfully."
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Save Experience Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save experience details."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});


// GET saved candidate preferences
router.get("/preferences", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    const [rows] = await pool.execute(
      `SELECT
        preference_id,
        candidate_id,
        preferred_location,
        preferred_entity_id,
        preferred_department,
        employment_type,
        hiring_category,
        willing_to_relocate,
        expected_salary,
        notice_period
      FROM candidate_preferences
      WHERE candidate_id = ?
      LIMIT 1`,
      [candidateId]
    );

    res.status(200).json({
      success: true,
      data: rows.length > 0 ? rows[0] : null
    });

  } catch (error) {
    console.error("Get Preferences Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch preferences."
    });
  }
});


// SAVE candidate preferences
router.post("/preferences", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    const {
      preferred_location,
      preferred_entity_id,
      preferred_department,
      employment_type,
      hiring_category,
      willing_to_relocate,
      expected_salary,
      notice_period
    } = req.body;

    if (
      !preferred_location ||
      !preferred_department ||
      !employment_type ||
      !hiring_category
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required preference fields."
      });
    }

    const salary =
      expected_salary === "" || expected_salary === null
        ? null
        : Number(expected_salary);

    if (
      salary !== null &&
      (!Number.isFinite(salary) || salary < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid expected salary."
      });
    }

    const entityId =
      preferred_entity_id === "" ||
      preferred_entity_id === null ||
      preferred_entity_id === undefined
        ? null
        : Number(preferred_entity_id);

    if (entityId !== null && !Number.isInteger(entityId)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid Drishtee entity."
      });
    }

    await pool.execute(
      `INSERT INTO candidate_preferences (
        candidate_id,
        preferred_location,
        preferred_entity_id,
        preferred_department,
        employment_type,
        hiring_category,
        willing_to_relocate,
        expected_salary,
        notice_period
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        preferred_location = VALUES(preferred_location),
        preferred_entity_id = VALUES(preferred_entity_id),
        preferred_department = VALUES(preferred_department),
        employment_type = VALUES(employment_type),
        hiring_category = VALUES(hiring_category),
        willing_to_relocate = VALUES(willing_to_relocate),
        expected_salary = VALUES(expected_salary),
        notice_period = VALUES(notice_period)`,
      [
        candidateId,
        preferred_location.trim(),
        entityId,
        preferred_department.trim(),
        employment_type,
        hiring_category,
        willing_to_relocate ? 1 : 0,
        salary,
        notice_period || null
      ]
    );

    res.status(200).json({
      success: true,
      message: "Preferences saved successfully!"
    });

  } catch (error) {
    console.error("Save Preferences Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save preferences."
    });
  }
});
// UPLOAD candidate resume
router.post(
  "/resume",
  authenticateCandidate,
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Resume upload failed."
        });
      }

      next();
    });
  },
  async (req, res) => {
    let newFilePath = null;

    try {
      const candidateId = req.candidateId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF resume."
        });
      }

      newFilePath = req.file.path;

      // Verify that the uploaded file actually has a PDF signature
      const fileBuffer = fs.readFileSync(newFilePath);
      const pdfSignature = fileBuffer.subarray(0, 5).toString();

      if (pdfSignature !== "%PDF-") {
        fs.unlinkSync(newFilePath);
        return res.status(400).json({
          success: false,
          message: "The selected file is not a valid PDF."
        });
      }

      // Get previously uploaded resume
      const [existingRows] = await pool.execute(
        "SELECT resume_path FROM candidates WHERE candidate_id = ?",
        [candidateId]
      );

      if (existingRows.length === 0) {
        fs.unlinkSync(newFilePath);
        return res.status(404).json({
          success: false,
          message: "Candidate account not found."
        });
      }

      const oldResume = existingRows[0].resume_path;

      // Save only the generated filename in MySQL
      await pool.execute(
        "UPDATE candidates SET resume_path = ? WHERE candidate_id = ?",
        [req.file.filename, candidateId]
      );

      // Remove old file after the database update succeeds
      if (oldResume) {
        const oldFileName = path.basename(oldResume);
        const oldFilePath = path.join(resumeDirectory, oldFileName);

        if (
          path.dirname(oldFilePath) === resumeDirectory &&
          fs.existsSync(oldFilePath)
        ) {
          fs.unlinkSync(oldFilePath);
        }
      }

      res.status(200).json({
        success: true,
        message: "Resume uploaded successfully!",
        data: {
          fileName: req.file.originalname,
          fileSize: req.file.size
        }
      });

    } catch (error) {
      console.error("Resume Upload Error:", error);

      // Clean up newly uploaded file if saving failed
      if (newFilePath && fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }

      res.status(500).json({
        success: false,
        message: "Unable to save your resume."
      });
    }
  }
);
// GET candidate resume information
router.get("/resume", authenticateCandidate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT resume_path
       FROM candidates
       WHERE candidate_id = ?
       LIMIT 1`,
      [req.candidateId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found."
      });
    }

    const resumePath = rows[0].resume_path;

    res.status(200).json({
      success: true,
      data: {
        hasResume: Boolean(resumePath),
        fileName: resumePath
          ? path.basename(resumePath)
          : null
      }
    });

  } catch (error) {
    console.error("Get Resume Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch resume information."
    });
  }
});
// DOWNLOAD candidate resume
router.get("/resume/download", authenticateCandidate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT resume_path
       FROM candidates
       WHERE candidate_id = ?
       LIMIT 1`,
      [req.candidateId]
    );

    if (rows.length === 0 || !rows[0].resume_path) {
      return res.status(404).json({
        success: false,
        message: "No resume found."
      });
    }

    const fileName = path.basename(rows[0].resume_path);
    const filePath = path.join(resumeDirectory, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file is missing from storage."
      });
    }

    res.download(filePath, "Drishtee_Resume.pdf");

  } catch (error) {
    console.error("Resume Download Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to download resume."
    });
  }
});
// DELETE candidate resume
router.delete("/resume", authenticateCandidate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT resume_path
       FROM candidates
       WHERE candidate_id = ?`,
      [req.candidateId]
    );

    if (rows.length === 0 || !rows[0].resume_path) {
      return res.status(404).json({
        success: false,
        message: "No resume found."
      });
    }

    const fileName = path.basename(rows[0].resume_path);
    const filePath = path.join(resumeDirectory, fileName);

    await pool.execute(
      "UPDATE candidates SET resume_path = NULL WHERE candidate_id = ?",
      [req.candidateId]
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully."
    });

  } catch (error) {
    console.error("Resume Delete Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete resume."
    });
  }
});

// =====================================
// GET COMPLETE CANDIDATE PROFILE FOR REVIEW
// =====================================

router.get("/review", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    // Personal details
    const [personalRows] = await pool.execute(
      `SELECT
        c.candidate_id,
        c.full_name,
        c.email,
        c.phone,
        c.resume_path,
        c.profile_status,
        c.profile_submitted_at,
        DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS date_of_birth,
        p.gender,
        p.current_address,
        p.current_city,
        p.current_state,
        p.current_pincode,
        p.permanent_address,
        p.permanent_city,
        p.permanent_state,
        p.permanent_pincode
      FROM candidates c
      LEFT JOIN candidate_profiles p
        ON c.candidate_id = p.candidate_id
      WHERE c.candidate_id = ?
      LIMIT 1`,
      [candidateId]
    );

    if (personalRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found."
      });
    }

    // Education details
    const [educationRows] = await pool.execute(
      `SELECT *
       FROM candidate_education
       WHERE candidate_id = ?
       ORDER BY education_id ASC`,
      [candidateId]
    );

    // Experience details
    const [experienceRows] = await pool.execute(
      `SELECT
        experience_id,
        organisation_name,
        job_title,
        employment_type,
        start_date,
        end_date,
        currently_working,
        description,
        CASE
          WHEN experience_letter_path IS NOT NULL
          THEN 1 ELSE 0
        END AS has_experience_letter
       FROM candidate_experience
       WHERE candidate_id = ?
       ORDER BY start_date DESC`,
      [candidateId]
    );

    // Job preferences
    const [preferenceRows] = await pool.execute(
      `SELECT
        cp.preferred_location,
        cp.preferred_entity_id,
        cp.preferred_department,
        cp.employment_type,
        cp.hiring_category,
        cp.willing_to_relocate,
        cp.expected_salary,
        cp.notice_period,
        e.entity_name,
        e.entity_code
       FROM candidate_preferences cp
       LEFT JOIN entities e
         ON cp.preferred_entity_id = e.entity_id
       WHERE cp.candidate_id = ?
       LIMIT 1`,
      [candidateId]
    );

    const candidate = personalRows[0];

    res.status(200).json({
      success: true,
      data: {
        personal: candidate,
        education: educationRows,
        experience: experienceRows,
        preferences: preferenceRows[0] || null,
        resume: {
          uploaded: Boolean(candidate.resume_path),
          fileName: candidate.resume_path || null
        }
      }
    });

  } catch (error) {
    console.error("Review Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load candidate review."
    });
  }
});


// =====================================
// FINAL CANDIDATE PROFILE SUBMISSION
// =====================================

router.post("/submit", authenticateCandidate, async (req, res) => {
  try {
    const candidateId = req.candidateId;

    // Check personal details
    const [personalRows] = await pool.execute(
      `SELECT
        c.full_name,
        c.email,
        c.phone,
        c.resume_path,
        p.date_of_birth,
        p.current_address,
        p.current_city,
        p.current_state,
        p.current_pincode,
        p.permanent_address,
        p.permanent_city,
        p.permanent_state,
        p.permanent_pincode
       FROM candidates c
       LEFT JOIN candidate_profiles p
         ON c.candidate_id = p.candidate_id
       WHERE c.candidate_id = ?
       LIMIT 1`,
      [candidateId]
    );

    if (personalRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found."
      });
    }

    const personal = personalRows[0];

    const personalComplete =
      personal.full_name &&
      personal.email &&
      personal.phone &&
      personal.date_of_birth &&
      personal.current_address &&
      personal.current_city &&
      personal.current_state &&
      personal.current_pincode &&
      personal.permanent_address &&
      personal.permanent_city &&
      personal.permanent_state &&
      personal.permanent_pincode;

    if (!personalComplete) {
      return res.status(400).json({
        success: false,
        message: "Please complete your Personal Details."
      });
    }

    // Check education
    const [educationRows] = await pool.execute(
      `SELECT education_id
       FROM candidate_education
       WHERE candidate_id = ?
       LIMIT 1`,
      [candidateId]
    );

    if (educationRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add your Education Details."
      });
    }

    // Check preferences
    const [preferenceRows] = await pool.execute(
      `SELECT preference_id
       FROM candidate_preferences
       WHERE candidate_id = ?
       LIMIT 1`,
      [candidateId]
    );

    if (preferenceRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please complete your Job Preferences."
      });
    }

    // Check resume
    if (!personal.resume_path) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume."
      });
    }

    // Mark profile completed
    await pool.execute(
      `UPDATE candidates
       SET profile_status = 'Completed',
           profile_submitted_at = NOW()
       WHERE candidate_id = ?`,
      [candidateId]
    );

    res.status(200).json({
      success: true,
      message: "Your candidate profile has been submitted successfully!"
    });

  } catch (error) {
    console.error("Candidate Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit your profile."
    });
  }
});


module.exports = router;
