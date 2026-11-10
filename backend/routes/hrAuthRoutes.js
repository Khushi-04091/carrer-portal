
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const router = express.Router();

// HR Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration error."
      });
    }

    // Find HR user
    const [users] = await pool.query(
      `SELECT hr_id, full_name, email, password_hash, role, status
       FROM hr_users
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const hr = users[0];

    // Check account status
    if (hr.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your HR account is inactive. Please contact the administrator."
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      hr.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Generate HR JWT
    const token = jwt.sign(
      {
        hrId: hr.hr_id,
        role: hr.role,
        userType: "hr"
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      success: true,
      message: "HR login successful.",
      token,
      hr: {
        hr_id: hr.hr_id,
        full_name: hr.full_name,
        email: hr.email,
        role: hr.role
      }
    });

  } catch (error) {
    console.error("HR Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during HR login."
    });
  }
});

module.exports = router;
