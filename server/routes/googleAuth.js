// routes/auth.js
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();


router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Redirect to deployed frontend
    res.redirect(
      `https://oauth-note-app.netlify.app/dashboard?token=${token}&name=${encodeURIComponent(
        req.user.name
      )}&email=${encodeURIComponent(req.user.email)}`
    );
  }
);



export default router;
