const express = require('express');
const contactRouter = express.Router();
const { body } = require('express-validator');
const { submitContactForm, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validation');
const { protect, isAdmin } = require('../middleware/auth');


// Submit contact form
contactRouter.post('/', validateContact, submitContactForm);

// Get all messages (admin only - will add auth later)
contactRouter.get('/', protect, isAdmin, getMessages);

// Mark message as read
contactRouter.put('/:id/read', protect, isAdmin, markAsRead);

// Delete message,
contactRouter.delete('/:id', protect, isAdmin, deleteMessage);

module.exports = contactRouter;