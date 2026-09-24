const bcrypt = require("bcrypt");
const pool = require("../db/connection");
const generateToken = require("../utils/jwt");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed",
        });
    }
};

const me = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, tenant_id
             FROM users
             WHERE id = $1 AND tenant_id = $2`,
            [req.user.userId, req.user.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get user",
        });
    }
};

module.exports = {
    login,
    me,
};