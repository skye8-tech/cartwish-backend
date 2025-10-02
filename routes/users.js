const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const User = require("../models/users");
const authMiddleware = require("../middleware/auth");
const { generateToken } = require("../helper");

const createUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    address: Joi.string().min(5).required(),
});

router.post("/", async (req, res) => {
    const { name, email, password, address } = req.body;

    // Validation with Joi
    const joiValidation = createUserSchema.validate(req.body);
    if (joiValidation.error) {
        return res.status(400).json(joiValidation.error.details[0].message);
    }

    // Checks if user exists already
    const user = await User.findOne({ email: email });

    if (user) {
        return res.status(400).json({ message: "user already exists" });
    }

    // Creates new user
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({
        name: name,
        email: email,
        password: hashedPass,
        address: address,
    });

    await newUser.save();

    const token = generateToken({ _id: newUser._id, name: newUser.name });

    return res.status(201).json(token);
});

router.get("/", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    return res.json(user);
});

module.exports = router;
