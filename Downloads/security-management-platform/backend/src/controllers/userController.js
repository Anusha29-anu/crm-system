const bcrypt = require("bcrypt");
const pool = require("../db/connection");

const getUsers = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE tenant_id = $1
             ORDER BY id`,
            [tenantId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get users",
        });
    }
};

const createUser = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required",
            });
        }

        const allowedRoles = ["ADMIN", "MANAGER", "USER"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const existingUser = await pool.query(
            `SELECT id FROM users
             WHERE email = $1 AND tenant_id = $2`,
            [email, tenantId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
             (tenant_id, name, email, password_hash, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, created_at`,
            [tenantId, name, email, passwordHash, role]
        );

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create user",
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.params.id;
        const { name, role } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET name = $1, role = $2
             WHERE id = $3 AND tenant_id = $4
             RETURNING id, name, email, role`,
            [name, role, userId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            message: "User updated successfully",
            user: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update user",
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.params.id;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id = $1 AND tenant_id = $2
             RETURNING id`,
            [userId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete user",
        });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
};