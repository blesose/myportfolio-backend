const express = require('express');
const adminRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const { validateLogin, validateId } = require('../middleware/validation');
const { protect, isAdmin, generateToken } = require('../middleware/auth');

// Public login route
adminRouter.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // In production, you'd check against database
        // For now, check environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = generateToken('admin', email, 'admin');

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    email,
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});

// Protected routes below
adminRouter.use(protect, isAdmin);

// Get dashboard stats
adminRouter.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalMessages: await Message.countDocuments(),
            unreadMessages: await Message.countDocuments({ read: false }),
            totalLeads: await Lead.countDocuments(),
            qualifiedLeads: await Lead.countDocuments({ status: 'qualified' }),
            newLeads: await Lead.countDocuments({ status: 'new' }),
            activeConversations: await Conversation.countDocuments({ 
                updatedAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
            }),
            recentMessages: await Message.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email message read createdAt'),
            recentLeads: await Lead.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('conversationId', 'messages')
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

// Get all leads with filtering
adminRouter.get('/leads', async (req, res) => {
    try {
        const { status, score, startDate, endDate } = req.query;
        let query = {};

        if (status) query.status = status;
        if (score) query.score = { $gte: parseInt(score) };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const leads = await Lead.find(query)
            .sort({ score: -1, createdAt: -1 })
            .populate('conversationId');
        
        res.json({
            success: true,
            count: leads.length,
            data: leads
        });

    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leads'
        });
    }
});

// Get single lead
adminRouter.get('/leads/:id', validateId, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('conversationId');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            data: lead
        });

    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lead'
        });
    }
});

// Update lead status
adminRouter.put('/leads/:id', validateId, async (req, res) => {
    try {
        const { status, notes, followUpDate } = req.body;

        const updateData = {
            status,
            updatedAt: Date.now()
        };

        if (notes) {
            updateData.$push = { notes: { content: notes, createdAt: new Date() } };
        }

        if (followUpDate) {
            updateData.followUpDate = new Date(followUpDate);
        }

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            message: 'Lead updated successfully',
            data: lead
        });

    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lead'
        });
    }
});

// Get all conversations
adminRouter.get('/conversations', async (req, res) => {
    try {
        const { isLead, status, limit = 50 } = req.query;
        let query = {};

        if (isLead === 'true') query.isLead = true;
        if (status) query.status = status;

        const conversations = await Conversation.find(query)
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: conversations.length,
            data: conversations
        });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations'
        });
    }
});

// Get single conversation
adminRouter.get('/conversations/:sessionId', async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ 
            sessionId: req.params.sessionId 
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.json({
            success: true,
            data: conversation
        });

    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversation'
        });
    }
});

// Export conversations (for backup/analytics)
adminRouter.get('/export/conversations', async (req, res) => {
    try {
        const conversations = await Conversation.find({})
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: conversations.length,
            data: conversations
        });

    } catch (error) {
        console.error('Error exporting conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting data'
        });
    }
});

module.exports = adminRouter;