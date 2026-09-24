const express = require("express");

const {
    getSecurityEvents,
    getSecurityEventById,
    createSecurityEvent,
    updateSecurityEvent,
} = require("../controllers/securityEventController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "USER"),
    getSecurityEvents
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "USER"),
    getSecurityEventById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    createSecurityEvent
);

router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateSecurityEvent
);

module.exports = router;