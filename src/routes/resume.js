const express = require('express');
const resumeRouter = express.Router();
const { downloadResume, getResumeInfo, getDownloadStats } = require('../controllers/resumeController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
resumeRouter.get('/download', (req, res) => downloadResume(req, res));
resumeRouter.get('/info', (req, res) => getResumeInfo(req, res));

// Protected admin routes (add auth later)
resumeRouter.get('/stats', protect, isAdmin, (req, res) => getDownloadStats(req, res));

module.exports = resumeRouter;