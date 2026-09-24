const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenant_id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};

module.exports = generateToken;