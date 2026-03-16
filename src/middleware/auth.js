const jwt = require('jsonwebtoken');

// Verify admin token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user info to request
            req.user = decoded;
            
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token invalid or expired'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Check if user is admin (additional check)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

// Optional auth (doesn't block if no token)
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (err) {
                // Token invalid but we continue without user
                req.user = null;
            }
        }

        next();
    } catch (error) {
        // Continue even if optional auth fails
        req.user = null;
        next();
    }
};

// Generate JWT token
const generateToken = (userId, email, role = 'admin') => {
    return jwt.sign(
        { 
            id: userId, 
            email, 
            role 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRE || '7d' 
        }
    );
};

module.exports = { protect, isAdmin, optionalAuth, generateToken }