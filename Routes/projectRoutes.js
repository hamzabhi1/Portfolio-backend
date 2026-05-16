import express from "express";
import upload from "../Middleware/upload.js";

import {
  getProjects,
  addProject,
  deleteProject
} from "../controllers/projectController.js";

const router = express.Router();

// GET PROJECTS
router.get("/", getProjects);

// CREATE PROJECT (WITH IMAGE UPLOAD)
router.post("/", upload.single("image"), addProject);

// DELETE PROJECT
router.delete("/:id", deleteProject);

export default router;