const Project = require('../models/Project');
// Create new project (admin only)
const createProject = async (req, res) => {
    try {
        const projectData = req.body;

        // Check if slug already exists
        const existingProject = await Project.findOne({ slug: projectData.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') });
        if (existingProject) {
            return res.status(400).json({
                success: false,
                message: 'Project with similar title already exists'
            });
        }

        const project = new Project(projectData);
        await project.save();

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project
        });

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating project'
        });
    }
};

// Get all projects
const getAllProjects = async (req, res) => {
    try {
        const { featured, limit = 10, page = 1 } = req.query;
        
        let query = {};
        if (featured === 'true') {
            query.featured = true;
        }

        const skip = (page - 1) * limit;

        const projects = await Project.find(query)
            .sort({ featured: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Project.countDocuments(query);

        res.json({
            success: true,
            data: projects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects'
        });
    }
};

// Get single project by slug or id
const getProject = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Check if identifier is MongoDB ObjectId
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
        
        let project;
        if (isObjectId) {
            project = await Project.findById(identifier);
        } else {
            project = await Project.findOne({ slug: identifier });
        }

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: project
        });

    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project'
        });
    }
};

// Update project (admin only)
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const project = await Project.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });

    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating project'
        });
    }
};

// Delete project (admin only)
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting project'
        });
    }
};

// Get projects by technology
const getProjectsByTech = async (req, res) => {
    try {
        const { tech } = req.params;

        const projects = await Project.find({ technologies: tech })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: projects
        });

    } catch (error) {
        console.error('Error fetching projects by technology:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects'
        });
    }
};

module.exports = {createProject, getProject, getAllProjects, updateProject, deleteProject, getProjectsByTech }