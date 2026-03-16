const mongoose = require('mongoose');

const resumeDownloadSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: {
        country: String,
        city: String,
        region: String
    },
    source: {
        type: String,
        enum: ['navbar', 'contact_page', 'direct_link', 'qr_code'],
        default: 'navbar'
    },
    success: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for analytics
resumeDownloadSchema.index({ timestamp: -1 });
resumeDownloadSchema.index({ ip: 1 });
resumeDownloadSchema.index({ source: 1 });

module.exports = mongoose.model('ResumeDownload', resumeDownloadSchema);