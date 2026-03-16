const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../utils/constants');

// General API limiter
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for contact form
exports.contactLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: RATE_LIMITS.CONTACT,
    message: {
        success: false,
        message: 'You have reached the maximum number of contact form submissions for today'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Chat message limiter
exports.chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: RATE_LIMITS.CHAT,
    message: {
        success: false,
        message: 'Message limit reached. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin routes limiter
exports.adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: RATE_LIMITS.ADMIN,
    message: {
        success: false,
        message: 'Too many admin requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});