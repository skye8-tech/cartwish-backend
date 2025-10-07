require("dotenv").config({
    quiet: true,
});
require("./config/passport");
require("winston-mongodb");
const express = require("express");
const mongoose = require("mongoose");
const expressListRoutes = require("express-list-routes");
const winston = require("winston");
const app = express();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({ level: "debug" }),
        new winston.transports.File({
            filename: "logs/errors.log",
            level: "error",
        }),
        // new winston.transports.MongoDB({
        //     db: "mongodb://localhost:27017/cartwish",
        //     level: "error",
        // }),
    ],
});

process.on("uncaughtException", async (err) => {
    logger.error("Uncaugth Exception", err);
    logger.on("finish", () => {
        process.exit(1);
    });
    logger.end();
});

process.on("unhandledRejection", async (err) => {
    logger.error("Unhandled Promise Rejection", err);
    logger.on("finish", () => {
        process.exit(1);
    });
    logger.end();
});

mongoose
    .connect("mongodb://localhost:27017/cartwish")
    .then(() => logger.info("MongoDB Connected\n"))
    .catch((err) => {
        logger.error("MongoDB Connection Failed", err);
        logger.on("finish", () => {
            process.exit(1);
        });
        logger.end();
    });

app.use(express.json());
app.use(express.urlencoded());
app.use("/upload/category", express.static("upload/category"));
app.use("/upload/products", express.static("upload/products"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.use((error, req, res, next) => {
    logger.error(error.message, {
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
    });
    return res.status(500).json({ message: "Internal Server Error!" });
});

const listAllRoutes = () => {
    console.log("All Available Endpoints");
    console.log("<----- auth endpoints ----->");
    expressListRoutes(authRoutes, { prefix: "/api/auth" });
    console.log("<----- user endpoints ----->");
    expressListRoutes(userRoutes, { prefix: "/api/user" });
    console.log("<----- category endpoints ----->");
    expressListRoutes(categoryRoutes, { prefix: "/api/category" });
    console.log("<----- products endpoints ----->");
    expressListRoutes(productRoutes, { prefix: "/api/product" });
    console.log("<----- carts endpoints ----->");
    expressListRoutes(cartRoutes, { prefix: "/api/cart" });
};

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    if (process.env.ROUTE_LIST == 1) {
        listAllRoutes();
    }
    logger.info(`Server is listening on port ${PORT}...`);
});
