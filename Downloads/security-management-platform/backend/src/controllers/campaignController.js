const pool = require("../db/connection");

const getCampaigns = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const result = await pool.query(
            `SELECT id, name, description, status, created_by, created_at, updated_at
             FROM campaigns
             WHERE tenant_id = $1
             ORDER BY created_at DESC`,
            [tenantId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get campaigns",
        });
    }
};

const getCampaignById = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const campaignId = req.params.id;

        const result = await pool.query(
            `SELECT id, name, description, status, created_by, created_at, updated_at
             FROM campaigns
             WHERE id = $1 AND tenant_id = $2`,
            [campaignId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get campaign",
        });
    }
};

const createCampaign = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.userId;

        const { name, description, status } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Campaign name is required",
            });
        }

        const allowedStatuses = [
            "DRAFT",
            "ACTIVE",
            "COMPLETED",
            "CANCELLED",
        ];

        const campaignStatus = status || "DRAFT";

        if (!allowedStatuses.includes(campaignStatus)) {
            return res.status(400).json({
                message: "Invalid campaign status",
            });
        }

        const result = await pool.query(
            `INSERT INTO campaigns
             (tenant_id, name, description, status, created_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, description, status, created_by, created_at, updated_at`,
            [tenantId, name, description || null, campaignStatus, userId]
        );

        res.status(201).json({
            message: "Campaign created successfully",
            campaign: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create campaign",
        });
    }
};

const updateCampaign = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const campaignId = req.params.id;

        const { name, description, status } = req.body;

        const allowedStatuses = [
            "DRAFT",
            "ACTIVE",
            "COMPLETED",
            "CANCELLED",
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid campaign status",
            });
        }

        const result = await pool.query(
            `UPDATE campaigns
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 status = COALESCE($3, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND tenant_id = $5
             RETURNING id, name, description, status, created_by, created_at, updated_at`,
            [name, description, status, campaignId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found",
            });
        }

        res.json({
            message: "Campaign updated successfully",
            campaign: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update campaign",
        });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const campaignId = req.params.id;

        const result = await pool.query(
            `DELETE FROM campaigns
             WHERE id = $1 AND tenant_id = $2
             RETURNING id`,
            [campaignId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found",
            });
        }

        res.json({
            message: "Campaign deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete campaign",
        });
    }
};


/* Assign a user to a campaign */
const assignUserToCampaign = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const campaignId = req.params.id;
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        // Check that the campaign belongs to the logged-in user's tenant
        const campaign = await pool.query(
            `SELECT id
             FROM campaigns
             WHERE id = $1 AND tenant_id = $2`,
            [campaignId, tenantId]
        );

        if (campaign.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found",
            });
        }

        // Check that the user belongs to the same tenant
        const user = await pool.query(
            `SELECT id
             FROM users
             WHERE id = $1 AND tenant_id = $2`,
            [userId, tenantId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Assign the user
        await pool.query(
            `INSERT INTO campaign_users (campaign_id, user_id)
             VALUES ($1, $2)`,
            [campaignId, userId]
        );

        res.status(201).json({
            message: "User assigned to campaign successfully",
        });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "User is already assigned to this campaign",
            });
        }

        res.status(500).json({
            message: "Failed to assign user",
        });
    }
};


/* Remove a user from a campaign */
const removeUserFromCampaign = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const campaignId = req.params.id;
        const userId = req.params.userId;

        // Check campaign belongs to the logged-in user's tenant
        const campaign = await pool.query(
            `SELECT id
             FROM campaigns
             WHERE id = $1 AND tenant_id = $2`,
            [campaignId, tenantId]
        );

        if (campaign.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found",
            });
        }

        const result = await pool.query(
            `DELETE FROM campaign_users
             WHERE campaign_id = $1 AND user_id = $2
             RETURNING campaign_id`,
            [campaignId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User assignment not found",
            });
        }

        res.json({
            message: "User removed from campaign successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to remove user",
        });
    }
};


module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    assignUserToCampaign,
    removeUserFromCampaign,
};