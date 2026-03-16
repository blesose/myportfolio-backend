const Message = require('../models/Message');
const Lead = require('../models/Lead');
const emailService = require('../utils/emailService');
const { validationResult } = require('express-validator');

const submitContactForm = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, company, message } = req.body;

        // Get IP and user agent
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Create message in database
        const newMessage = new Message({
            name,
            email,
            company,
            message,
            ip,
            userAgent
        });

        await newMessage.save();

        // Check if this email already has a lead in chat
        const existingLead = await Lead.findOne({ email }).sort({ createdAt: -1 });
        
        if (existingLead) {
            // Update existing lead with contact form info
            existingLead.status = 'contacted';
            existingLead.notes.push({
                content: `Contacted via form on ${new Date().toLocaleDateString()}`
            });
            await existingLead.save();
        } else {
            // Create new lead from contact form
            const lead = new Lead({
                name,
                email,
                company,
                source: 'contact_form',
                requirements: {
                    description: message
                },
                score: 60, // Contact form is high intent
                status: 'new'
            });
            await lead.save();
        }

        // Send confirmation email to user
        await emailService.sendContactConfirmation(email, name);

        // Send notification to admin
        await emailService.sendAdminNotification(newMessage);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully! I will get back to you soon.',
            data: {
                id: newMessage._id,
                name: newMessage.name,
                email: newMessage.email
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments();

        res.json({
            success: true,
            data: messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message marked as read',
            data: message
        });

    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating message'
        });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
};

module.exports = { submitContactForm, getMessages, markAsRead, deleteMessage }