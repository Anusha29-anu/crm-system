const express = require("express");

const {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    assignUserToCampaign,
    removeUserFromCampaign,
} = require("../controllers/campaignController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "USER"),
    getCampaigns
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "USER"),
    getCampaignById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    createCampaign
);

router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateCampaign
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteCampaign
);

router.post(
    "/:id/users",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    assignUserToCampaign
);

router.delete(
    "/:id/users/:userId",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    removeUserFromCampaign
);

module.exports = router;