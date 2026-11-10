
const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const router = express.Router();

// Candidate Registration API
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    // 1. Validate required fields
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields."
      });
    }

    // 2. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    // 3. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check whether email already exists
    const [existingCandidate] = await pool.execute(
      "SELECT candidate_id FROM candidates WHERE email = ?",
      [normalizedEmail]
    );

    if (existingCandidate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered. Please login."
      });
    }

    // 5. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Save candidate in MySQL
    const [result] = await pool.execute(
      `INSERT INTO candidates
       (full_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [
        full_name.trim(),
        normalizedEmail,
        phone.trim(),
        passwordHash
      ]
    );

    // 7. Send success response
    return res.status(201).json({
      success: true,
      message: "Your account has been created successfully!",
      candidateId: result.insertId
    });

  } catch (error) {
    console.error("Registration Error:", error);

    // Handle duplicate email if two requests arrive together
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
});

module.exports = router;
