const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const { generateToken } = require("../helper");

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ message: "Invalid Credentials" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
        const token = generateToken(user);
        user.password = undefined;
        user.role = undefined;
        user.__v = undefined;
        return res.status(200).json({ user: user, token: token });
    } else {
        return res.status(401).json({ message: "Invalid Password" });
    }
});

module.exports = router;
