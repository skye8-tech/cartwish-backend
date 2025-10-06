const express = require("express");
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const multer = require("multer");
const Product = require("../models/products");
const router = express.Router();

// Filters for image file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/products");
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
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/mov",
        "video/avi",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "invalid file type. Only JPEG, PNG, GIF, MP4, MOV, and AVI are allowed"
            )
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

router.post(
    "/",
    authMiddleware,
    checkRole("admin"),
    // checkRole("seller"),
    upload.array("images", 5),
    async (req, res) => {
        const { title, description, category, price, stock } = req.body;

        const images = req.files.map((image) => image.filename);

        if (images.length === 0) {
            return res.status(200).json({
                message: "At least one image is required!",
            });
        }

        const newProduct = new Product({
            title: title,
            description: description,
            category: category,
            price: price,
            stock: stock,
            images: images,
            seller: req.user._id,
        });

        await newProduct.save();

        return res.status(201).json({
            message: "Product Created Successfully",
            product: newProduct,
        });
    }
);

router.get("/", async (req, res) => {
    const products = await Product.find()
        .select("-description -seller -category -__v")
        .lean();

    const updatedProducts = products.map((product) => {
        const numberOfReviews = product.review.length;
        const sumOfRatings = product.review.reduce(
            (sum, review) => sum + review.rating,
            0
        );
        const averageRating = sumOfRatings / (numberOfReviews || 1);

        return {
            ...product,
            images: product.images[0],
            review: { numberOfReviews, averageRating },
        };
    });

    res.json(updatedProducts);
});
module.exports = router;
