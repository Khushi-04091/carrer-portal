
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Read SSL certificate from Render environment variable
// or use the local certificate when running on your laptop.
const caPath = path.join(__dirname, "..", "certs", "ca.pem");

let sslCertificate = process.env.DB_SSL_CA;

if (sslCertificate) {
    // Convert escaped newlines into actual newlines if necessary.
    sslCertificate = sslCertificate.replace(/\\n/g, "\n");
} else if (fs.existsSync(caPath)) {
    sslCertificate = fs.readFileSync(caPath, "utf8");
}

if (!sslCertificate) {
    throw new Error(
        "Aiven SSL certificate missing. Set DB_SSL_CA or provide backend/certs/ca.pem"
    );
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    ssl: {
        ca: sslCertificate,
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("Aiven MySQL Database Connected Successfully!");

        connection.release();
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        throw error;
    }
};

module.exports = { pool, connectDB };
