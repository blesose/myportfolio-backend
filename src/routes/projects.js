const express = require('express');
const projectRouter = express.Router();
const  { validateProject, validatePagination, validateId } = require("../middleware/validation")
const { createProject, updateProject, deleteProject, getAllProjects, getProjectsByTech, getProject } = require('../controllers/projectController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
projectRouter.get('/', validatePagination,  getAllProjects);
projectRouter.get('/tech/:tech', getProjectsByTech);
projectRouter.get('/:identifier', getProject);

// Admin routes (will add auth middleware later)
projectRouter.post('/', protect, isAdmin, validateProject, createProject);
projectRouter.put('/:id', protect, isAdmin, validateId, validateProject, updateProject);
projectRouter.delete('/:id', protect, isAdmin, validateId, deleteProject);

module.exports = projectRouter;