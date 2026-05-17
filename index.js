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
connectDB();

/* =========================
   CORS OPTIONS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://portfolio-frontend-psi-gray.vercel.app",
];

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FOLDER
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
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Message Sent Successfully",
    });

  } catch (error) {
    console.log("CONTACT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
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