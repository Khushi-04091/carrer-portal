
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const createHrAdmin = async () => {
  try {
    const name = process.env.HR_ADMIN_NAME;
    const email = process.env.HR_ADMIN_EMAIL;
    const password = process.env.HR_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "Please configure HR_ADMIN_NAME, HR_ADMIN_EMAIL and HR_ADMIN_PASSWORD in your local .env file."
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must contain at least 12 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.query(
      "SELECT hr_id FROM hr_users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      throw new Error("An HR account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO hr_users
       (full_name, email, password_hash, role, status)
       VALUES (?, ?, ?, 'Admin', 'Active')`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    console.log("HR Admin account created successfully!");
    console.log("Admin email:", normalizedEmail);
    console.log("Role: Admin");
  } catch (error) {
    console.error("HR Admin Creation Error:", error.message);
  } finally {
    await pool.end();
  }
};

createHrAdmin();
