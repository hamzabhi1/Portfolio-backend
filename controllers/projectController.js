import Project from "../models/projectModel.js";

// GET
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST (WITH MULTER IMAGE SUPPORT)
export const addProject = async (req, res) => {
  try {
    const { title, desc, tech } = req.body;

    const project = new Project({
      title,
      desc,
      tech: tech ? tech.split(",") : [],
      image: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : null
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};