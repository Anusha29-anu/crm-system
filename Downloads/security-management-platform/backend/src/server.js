const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/connection");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const securityEventRoutes = require("./routes/securityEventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Security Management API is running",
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/security-events", securityEventRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});