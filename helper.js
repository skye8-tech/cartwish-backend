const jwt = require("jsonwebtoken");
const generateToken = (data) => {
    return jwt.sign(
        { _id: data._id, name: data.name, role: data.role },
        process.env.JWT_KEY,
        {
            expiresIn: process.env.JWT_EXPIRATION_DURATION,
        }
    );
};

module.exports.generateToken = generateToken;
