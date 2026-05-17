import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

import connectDB from "./config/db.js";
import projectRoutes from "./Routes/projectRoutes.js";

dotenv.config();

const app = express();

/* =========================
   CONNECT DATABASE
========================= */
connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err.message));

/* =========================
   CORS
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

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static("uploads"));

/* =========================
   ROUTES
========================= */
app.use("/api/projects", projectRoutes);

/* =========================
   CONTACT API
========================= */
app.post("/api/contact", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log("EMAIL USER:", process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

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

    return res.status(200).json({
      success: true,
      message: "Message Sent Successfully",
    });

  } catch (error) {
    console.log("CONTACT ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

export default app;