import express from "express";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config();
import authRoutes from "./routes/auth.js";
import mongoose from "mongoose";
import  session  from "express-session";
import "./config/passport.js";
import passport from "passport";

import googleAuth from "./routes/googleAuth.js";
import router from "./routes/note.js";




const app =express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,  // ✅ use env
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api", router);
app.use("/api/auth/google", googleAuth);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});
