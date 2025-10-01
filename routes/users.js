const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/users");

router.post("/", async (req, res) => {
    const { name, email, password, address } = req.body;
    const user = await User.findOne({ email: email });

    if (user) {
        return res.status(400).json({ message: "user already exists" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({
        name: name,
        email: email,
        password: password,
        address: address,
    });

    await newUser.save();

    return res.status(201).json(newUser);
});

module.exports = router;
