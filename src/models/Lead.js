const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: String,
    company: String,
    source: {
        type: String,
        enum: ['chat', 'contact_form', 'referral', 'social'],
        default: 'chat'
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    requirements: {
        projectType: String,
        budget: String,
        timeline: String,
        description: String,
        features: [String]
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'negotiating', 'converted', 'lost'],
        default: 'new'
    },
    notes: [{
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    followUpDate: Date,
    convertedToClient: {
        type: Boolean,
        default: false
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
leadSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    // next();
});

// Indexes
leadSchema.index({ status: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ email: 1 });

module.exports = mongoose.model('Lead', leadSchema);