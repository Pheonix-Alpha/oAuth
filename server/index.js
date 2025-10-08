import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import aiRoutes from "./routes/aiRoutes.js";


dotenv.config();
import authRoutes from "./routes/auth.js";
import mongoose from "mongoose";

import "./config/passport.js";
import passport from "passport";

import googleAuth from "./routes/googleAuth.js";
import router from "./routes/note.js";




const app =express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://oauth-note-app.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.set("trust proxy", 1);



app.use(
  session({
    secret: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production
      httpOnly: true,
      sameSite: "none", // required for cross-site cookies
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api", router);
app.use("/api/auth/google", googleAuth);
app.use("/api/ai", aiRoutes);

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
