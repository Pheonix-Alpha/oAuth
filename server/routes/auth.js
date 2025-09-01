import express from "express";
import User from "../models/User.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup/request-otp", async (req, res) => {
  try {
    const { name, email,dob } = req.body;

    if (!email || !name)
      return res.status(400).json({ msg: "Name and Email required" });

  

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If OTP expired or user wants to resend, generate new OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      existingUser.otp = otp;
      existingUser.otpExpire = Date.now() + 5 * 60 * 1000;
      await existingUser.save();

      console.log(`📩 Resent OTP for signup (${email}): ${otp}`);
      return res.json({ message: "OTP resent to email",otp });
    }

      const otp = crypto.randomInt(100000, 999999).toString();

    const otpExpire = Date.now() + 5 * 60 * 1000;

   const newUser = new User({ name, email,dob, otp, otpExpire });
    await newUser.save();

    console.log(`📩 OTP for signup (${email}): ${otp}`);
    res.json({ message: "OTP sent to email", otp });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/signup/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp !== otp || Date.now() > user.otpExpire) {
      return res.status(400).json({ msg: "invalid OTP" });
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Signup successful",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/signin/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "invalid accound " });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;

    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();


     console.log(`📩 OTP for signin (${email}): ${otp}`);
    res.json({ message: "OTP sent to email",otp });

 } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/signin/verify-otp" , async(req,res)=>{
    try {
        const {email,otp} = req.body;

        const user = await User.findOne({email});

        if(!user) return res.status(400).json({msg:"invalid email"});

        if(user.otp !== otp ||  Date.now() > user.otpExpire){
            return res.status(400).json({msg:"Invalid or expired OTP"});

        }

 user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Signin successful", token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





export default router;
