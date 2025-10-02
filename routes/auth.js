const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const passport = require("passport");
const { generateToken } = require("../helper");

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ message: "Invalid Credentials" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
        const token = generateToken({ _id: user._id, name: user.name });
        user.password = undefined;
        user.role = undefined;
        user.__v = undefined;
        return res.status(200).json({ user: user, token: token });
    } else {
        return res.status(401).json({ message: "Invalid Password" });
    }
});

// Google login routes
router.get(
    "/google", // usually /auth/google
    passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "http://localhost:5173/login",
    }),
    async (req, res) => {
        // check if user is available or not using googleId or email
        const profile = req.user;
        const user = User.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (user) {
            // User is available - update googleId & generate token & send it in response
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
        } else {
            // User is not available - create a new user & generate token & send it in response
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
            });

            await user.save();
        }
        // generate token
        const token = generateToken({ _id: user._id, name: user.name });

        return res
            .redirect(`http://localhost:5173/dashboard?token=${token}`)
            .json({ user: user, token: token });
    }
);

module.exports = router;
