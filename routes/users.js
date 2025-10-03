const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const User = require("../models/users");
const authMiddleware = require("../middleware/auth");
const { generateToken } = require("../helper");
const checkRole = require("../middleware/checkRole");

const createUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    address: Joi.string().min(5).required(),
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    address: Joi.string().min(5),
});

// Create a user
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

    const token = generateToken({
        _id: newUser._id,
        name: newUser.name,
        role: newUser.role,
    });

    return res.status(201).json({
        message: "Success",
        token: token,
    });
});

// Get authenticated user
router.get("/", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({
        message: "Success",
        user: user,
    });
});

// Get all users
router.get("/all", authMiddleware, checkRole("admin"), async (req, res) => {
    const users = await User.find().select("-password");
    return res.status(200).json({
        message: "Success",
        users: users,
    });
});

// Get a specific user
router.get("/:id", authMiddleware, checkRole("admin"), async (req, res) => {
    const user = await User.find({ _id: req.params.id }).select("-password");
    return res.status(200).json({
        message: "Success",
        user: user,
    });
});

// Update a specific user route
router.put("/:id", authMiddleware, checkRole("admin"), (req, res) => {
    const id = req.params.id ? req.params.id : req.user._id;
    return updateUser(req, res, id);
});

// Update authenticated user route
router.put("/", authMiddleware, (req, res) => {
    const id = req.params.id ? req.params.id : req.user._id;
    return updateUser(req, res, id);
});

// Update a specific user function
const updateUser = async (req, res, id) => {
    // Validation with Joi
    const joiValidation = updateUserSchema.validate(req.body);
    if (joiValidation.error) {
        return res.status(400).json(joiValidation.error.details[0].message);
    }

    const { name, email, address } = req.body;

    const user = await User.findById(id).select("-password");

    if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
        if (address) user.address = address;
    }

    const result = await user.save();
    return res.status(201).json({
        message: "Successfully Updated User",
        user: result,
    });
};

// Delete a specific user
router.delete("/:id", authMiddleware, checkRole("user"), async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
        message: "Deleted Successfully",
    });
});

// Delete authenticated user // only possible for users, later on maybe add sellers too
router.delete("/", authMiddleware, checkRole("user"), async (req, res) => {
    await User.findByIdAndDelete(req.user._id);
    return res.status(200).json({
        message: "Deleted Successfully",
    });
});

module.exports = router;
