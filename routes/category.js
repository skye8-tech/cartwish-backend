const express = require("express");
const router = express.Router();
const multer = require("multer");
const Category = require("../models/category");
const checkRole = require("../middleware/checkRole");
const authMiddleware = require("../middleware/auth");

// Filters for image file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/category");
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9.-_]/g, "");
        cb(null, `${timestamp}-${originalName}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("invalid file type. Only JPEG, PNG, and GIF are allowed"));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

// create a category
router.post(
    "/",
    authMiddleware,
    checkRole("admin"),
    upload.single("icon"),
    async (req, res) => {
        if (!req.body.name || !req.file) {
            return res
                .status(400)
                .json({ message: "Name and icon are required" });
        }

        const newCategory = new Category({
            name: req.body.name,
            image: req.file.filename,
        });

        await newCategory.save();

        res.status(201).json({
            message: "Category added successfully",
            category: newCategory,
        });
    }
);

// Get all categories
router.get("/", authMiddleware, async (req, res) => {
    const categories = await Category.find().sort("name");

    return res.status(200).json({
        message: "Success",
        categories: categories,
    });
});

// Get a categories
router.get("/:id", authMiddleware, async (req, res) => {
    const category = await Category.findById(req.params.id);

    return res.status(200).json({
        message: "Success",
        category: category,
    });
});

// Update a category // name and image are a must
router.put("/:id", authMiddleware, checkRole("admin"), async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ message: "Name is required!" });
    }

    await Category.findByIdAndUpdate(req.params.id, {
        $set: { name: req.body.name },
    });

    res.status(200).json({
        message: "Category updated successfully",
    });
});

// Delete a category
router.delete("/:id", authMiddleware, checkRole("admin"), async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        message: "Success",
    });
});

module.exports = router;
