require("dotenv").config();
require("./config/passport");
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

mongoose
    .connect("mongodb://localhost:27017/cartwish")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Failed"));

app.use(express.json());
app.use(express.urlencoded());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
