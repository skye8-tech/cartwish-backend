require("dotenv").config();
require("./config/passport");
const express = require("express");
const mongoose = require("mongoose");
const expressListRoutes = require("express-list-routes");
const app = express();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/category");

mongoose
    .connect("mongodb://localhost:27017/cartwish")
    .then(() => console.log("MongoDB Connected\n"))
    .catch((err) => console.log("MongoDB Connection Failed"));

app.use(express.json());
app.use(express.urlencoded());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    // List all endponts
    console.log("All Available Endpoints");
    expressListRoutes(authRoutes, { prefix: "/api/auth" });
    expressListRoutes(userRoutes, { prefix: "/api/user" });
    expressListRoutes(categoryRoutes, { prefix: "/api/category" });
    console.log(`Server is listening on port ${PORT}...`);
});
