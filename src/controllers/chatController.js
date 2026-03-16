const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const chatbotLogic = require('../utils/chatbotLogic');
const emailService = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');

const processMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Generate or use existing session ID
        const chatSessionId = sessionId || uuidv4();

        // Find or create conversation
        let conversation = await Conversation.findOne({ sessionId: chatSessionId });
        
        if (!conversation) {
            conversation = new Conversation({
                sessionId: chatSessionId,
                messages: [],
                isLead: false
            });
        }

        // Add user message to history
        conversation.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Analyze intent
        const intent = chatbotLogic.analyzeIntent(message);
        
        // Check if this is a potential lead
        const isLead = chatbotLogic.isPotentialLead(message, intent);
        
        // Extract requirements if applicable
        const requirements = chatbotLogic.extractRequirements(message);
        if (requirements.projectType || requirements.budget || requirements.timeline) {
            conversation.requirements = {
                ...conversation.requirements,
                ...requirements
            };
        }

        // Update topics
        if (!conversation.topics.includes(intent) && intent !== 'fallback') {
            conversation.topics.push(intent);
        }

        // Generate bot response
        const botResponse = chatbotLogic.generateResponse(intent, message, conversation.messages);

        // Add bot response to history
        conversation.messages.push({
            role: 'bot',
            content: botResponse,
            intent: intent,
            timestamp: new Date()
        });

        // Update lead status
        if (isLead && !conversation.isLead) {
            conversation.isLead = true;
            conversation.leadScore = Math.min(conversation.leadScore + 30, 100);
            conversation.status = 'qualified';

            // Create lead record
            const lead = new Lead({
                conversationId: conversation._id,
                requirements: conversation.requirements,
                score: conversation.leadScore,
                source: 'chat'
            });
            await lead.save();

            // Try to extract user info from messages
            const userMessages = conversation.messages.filter(m => m.role === 'user');
            const lastMessages = userMessages.slice(-3).map(m => m.content.toLowerCase());
            
            // Simple email extraction
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
            for (const msg of userMessages) {
                const match = msg.content.match(emailRegex);
                if (match) {
                    conversation.userInfo = conversation.userInfo || {};
                    conversation.userInfo.email = match[0];
                    lead.email = match[0];
                    break;
                }
            }

            // Send notification for high-value leads
            if (conversation.leadScore >= 50) {
                await emailService.sendLeadNotification(lead);
            }
        }

        await conversation.save();

        // Return response with session ID
        res.json({
            success: true,
            response: botResponse,
            intent: intent,
            sessionId: chatSessionId,
            isLead: conversation.isLead
        });

    } catch (error) {
        console.error('Chat processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing chat message',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

const getConversation = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const conversation = await Conversation.findOne({ sessionId });
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversation'
        });
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { name, email, phone, company } = req.body;

        const conversation = await Conversation.findOne({ sessionId });
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        conversation.userInfo = {
            ...conversation.userInfo,
            name: name || conversation.userInfo?.name,
            email: email || conversation.userInfo?.email,
            phone: phone || conversation.userInfo?.phone,
            company: company || conversation.userInfo?.company
        };

        // Update lead if exists
        if (conversation.isLead) {
            const lead = await Lead.findOne({ conversationId: conversation._id });
            if (lead) {
                lead.name = name || lead.name;
                lead.email = email || lead.email;
                lead.phone = phone || lead.phone;
                lead.company = company || lead.company;
                await lead.save();
            }
        }

        await conversation.save();

        res.json({
            success: true,
            message: 'User info updated successfully',
            userInfo: conversation.userInfo
        });

    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user info'
        });
    }
};

const clearConversation = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        await Conversation.deleteOne({ sessionId });
        
        res.json({
            success: true,
            message: 'Conversation cleared'
        });

    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing conversation'
        });
    }
};

module.exports = { processMessage, getConversation, updateUserInfo, clearConversation }