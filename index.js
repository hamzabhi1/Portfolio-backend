import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";

import connectDB from "./config/db.js";
import projectRoutes from "./Routes/projectRoutes.js";

dotenv.config();

const app = express();

/* =========================
   BODY PARSER (IMPORTANT: FIRST)
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SAFE UPLOADS FOLDER
========================= */
if (!fs.existsSync("/tmp/uploads")) {
  fs.mkdirSync("/tmp/uploads", { recursive: true });
}

/* =========================
   STATIC FILES
⚠️ VERCEL NOTE: /uploads is NOT persistent
========================= */
app.use("/uploads", express.static("/tmp/uploads"));

/* =========================
   CORS (PRODUCTION SAFE)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://portfolio-frontend-psi-gray.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true); // keep open for now
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   CONNECT DATABASE (FIXED)
========================= */
connectDB();

/* =========================
   ROUTES
========================= */
app.use("/api/projects", projectRoutes);

/* =========================
   CONTACT API
========================= */
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Missing EMAIL config in Vercel env",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Message From ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Message Sent Successfully",
    });

  } catch (error) {
    console.log("CONTACT ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({
    message: "API Running Successfully",
    mongo: process.env.MONGO_URI ? "CONNECTED" : "MISSING"
  });
});

export default app;