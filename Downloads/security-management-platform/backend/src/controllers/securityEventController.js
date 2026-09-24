const pool = require("../db/connection");

const getSecurityEvents = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { status, severity, eventType } = req.query;

        const allowedSeverities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ];

        const allowedStatuses = [
            "OPEN",
            "INVESTIGATING",
            "RESOLVED"
        ];

        const filters = ["tenant_id = $1"];
        const values = [tenantId];

        if (status) {
            const normalizedStatus = status.toUpperCase();

            if (!allowedStatuses.includes(normalizedStatus)) {
                return res.status(400).json({
                    message: "Invalid status",
                });
            }

            filters.push(`status = $${values.length + 1}`);
            values.push(normalizedStatus);
        }

        if (severity) {
            const normalizedSeverity = severity.toUpperCase();

            if (!allowedSeverities.includes(normalizedSeverity)) {
                return res.status(400).json({
                    message: "Invalid severity",
                });
            }

            filters.push(`severity = $${values.length + 1}`);
            values.push(normalizedSeverity);
        }

        if (eventType) {
            const normalizedEventType = eventType.toUpperCase();

            filters.push(`event_type = $${values.length + 1}`);
            values.push(normalizedEventType);
        }

        const query = `SELECT id, event_type, severity, status, description, created_at
             FROM security_events
             WHERE ${filters.join(" AND ")}
             ORDER BY created_at DESC`;

        const result = await pool.query(query, values);

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get security events",
        });
    }
};

const getSecurityEventById = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const eventId = req.params.id;

        const result = await pool.query(
            `SELECT id, event_type, severity, status, description, created_at
             FROM security_events
             WHERE id = $1 AND tenant_id = $2`,
            [eventId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Security event not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get security event",
        });
    }
};

const createSecurityEvent = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const {
            eventType,
            severity,
            status,
            description
        } = req.body;

        if (!eventType || !severity || !status) {
            return res.status(400).json({
                message: "Event type, severity and status are required",
            });
        }

        const allowedSeverities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ];

        const allowedStatuses = [
            "OPEN",
            "INVESTIGATING",
            "RESOLVED"
        ];

        if (!allowedSeverities.includes(severity)) {
            return res.status(400).json({
                message: "Invalid severity",
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const result = await pool.query(
            `INSERT INTO security_events
             (tenant_id, event_type, severity, status, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, event_type, severity, status, description, created_at`,
            [
                tenantId,
                eventType,
                severity,
                status,
                description || null
            ]
        );

        res.status(201).json({
            message: "Security event created successfully",
            event: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create security event",
        });
    }
};

const updateSecurityEvent = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const eventId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required",
            });
        }

        const allowedStatuses = [
            "OPEN",
            "INVESTIGATING",
            "RESOLVED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const result = await pool.query(
            `UPDATE security_events
             SET status = $1
             WHERE id = $2 AND tenant_id = $3
             RETURNING id, event_type, severity, status, description, created_at`,
            [status, eventId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Security event not found",
            });
        }

        res.json({
            message: "Security event updated successfully",
            event: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update security event",
        });
    }
};

module.exports = {
    getSecurityEvents,
    getSecurityEventById,
    createSecurityEvent,
    updateSecurityEvent,
};