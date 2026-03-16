const express = require('express');
const chatRouter = express.Router();
const { processMessage, getConversation, updateUserInfo, clearConversation } = require('../controllers/chatController');
const { validateChatMessage, validateSessionId, validateUserInfo } = require('../middleware/validation');

// Process chat message
chatRouter.post('/message', validateChatMessage, processMessage);

// Get conversation history
chatRouter.get('/conversation/:sessionId', validateSessionId, getConversation);

// Update user info in conversation
chatRouter.put('/conversation/:sessionId/user', validateSessionId, validateUserInfo, updateUserInfo);

// Clear conversation
chatRouter.delete('/conversation/:sessionId', validateSessionId, clearConversation);

module.exports = chatRouter;