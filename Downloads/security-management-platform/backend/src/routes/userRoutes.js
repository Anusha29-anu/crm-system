const express = require("express");

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getUsers
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createUser
);

router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateUser
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteUser
);

module.exports = router;