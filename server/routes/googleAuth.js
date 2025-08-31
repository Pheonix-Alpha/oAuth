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

    
     res.redirect(
      `http://localhost:5173/dashboard?token=${token}&name=${encodeURIComponent(
        req.user.name
      )}&email=${encodeURIComponent(req.user.email)}`
    );
  }
);


export default router;
