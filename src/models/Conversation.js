const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    intent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const conversationSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    messages: [messageSchema],
    userInfo: {
        name: String,
        email: String,
        phone: String,
        company: String
    },
    isLead: {
        type: Boolean,
        default: false
    },
    leadScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    topics: [String],
    requirements: {
        projectType: String,
        budget: String,
        timeline: String,
        features: [String]
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'qualified', 'closed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp
conversationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    // next();
});

// Indexes
conversationSchema.index({ isLead: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);

