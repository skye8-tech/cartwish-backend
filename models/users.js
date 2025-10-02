const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlenght: 3 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true },
    address: { type: String, required: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
