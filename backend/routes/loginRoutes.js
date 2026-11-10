
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const router = express.Router();

// Candidate Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error."
      });
    }

    // Find candidate by email
    const normalizedEmail = email.trim().toLowerCase();

    const [candidates] = await pool.execute(
      `SELECT candidate_id, full_name, email, phone, password_hash
       FROM candidates
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (candidates.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const candidate = candidates[0];

    // Compare entered password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      candidate.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Generate authentication token
    const token = jwt.sign(
      {
        candidateId: candidate.candidate_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    // Successful login
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      candidate: {
        candidate_id: candidate.candidate_id,
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
});

module.exports = router;
