const { body, param, query, validationResult } = require('express-validator');

// Validation rules for different routes

// Contact form validation
const validateContact = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .trim()
        .escape()
        .matches(/^[a-zA-Z\s-']+$/).withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
        .toLowerCase(),
    
    body('company')
        .optional()
        .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters')
        .trim()
        .escape(),
    
    body('message')
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
        .trim()
        .escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Project validation (for admin routes)
const validateProject = [
    body('title')
        .notEmpty().withMessage('Project title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
        .trim()
        .escape(),
    
    body('shortDescription')
        .notEmpty().withMessage('Short description is required')
        .isLength({ max: 200 }).withMessage('Short description cannot exceed 200 characters')
        .trim()
        .escape(),
    
    body('description')
        .notEmpty().withMessage('Full description is required')
        .isLength({ min: 50 }).withMessage('Description must be at least 50 characters')
        .trim()
        .escape(),
    
    body('category')
        .optional()
        .isIn(['fullstack', 'frontend', 'backend', 'api']).withMessage('Invalid category'),
    
    body('technologies')
        .isArray({ min: 1 }).withMessage('At least one technology is required')
        .custom((techs) => {
            if (!techs.every(t => typeof t === 'string')) {
                throw new Error('Technologies must be strings');
            }
            return true;
        }),
    
    body('githubUrl')
        .notEmpty().withMessage('GitHub URL is required')
        .isURL().withMessage('Please provide a valid URL')
        .matches(/^https?:\/\/(www\.)?github\.com/).withMessage('Must be a valid GitHub URL'),
    
    body('liveUrl')
        .optional()
        .isURL().withMessage('Please provide a valid URL'),
    
    body('featured')
        .optional()
        .isBoolean().withMessage('Featured must be a boolean'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Chat message validation
const validateChatMessage = [
    body('message')
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
        .trim()
        .escape(),
    
    body('sessionId')
        .optional()
        .isString().withMessage('Session ID must be a string')
        .isLength({ min: 8, max: 100 }).withMessage('Invalid session ID'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// User info validation (for chat)
const validateUserInfo = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .trim()
        .escape()
        .matches(/^[a-zA-Z\s-']+$/).withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
    
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
        .toLowerCase(),
    
    body('phone')
        .optional()
        .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).withMessage('Please provide a valid phone number'),
    
    body('company')
        .optional()
        .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters')
        .trim()
        .escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// ID parameter validation
const validateId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Session ID validation
const validateSessionId = [
    param('sessionId')
        .isString().withMessage('Session ID must be a string')
        .isLength({ min: 8, max: 100 }).withMessage('Invalid session ID'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Login validation
const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
        .toLowerCase(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = { validateContact, validateChatMessage, validateProject, validateUserInfo, validateId, validateSessionId, validatePagination, validateLogin }