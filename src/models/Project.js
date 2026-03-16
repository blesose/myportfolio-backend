const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true
    },

    description: {
        type: String,
        required: [true, 'Project description is required']
    },

    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },

    category: {
        type: String,
        enum: ['fullstack', 'frontend', 'backend', 'api'],
        default: 'fullstack'
    },

    technologies: [{
        type: String,
        required: true
    }],

    imageUrl: String,

    githubUrl: {
        type: String,
        required: true
    },

    liveUrl: String,

    featured: {
        type: Boolean,
        default: false
    },

    completionDate: Date,

    highlights: [String],

    challenges: String,

    solutions: String,

    status: {
        type: String,
        enum: ['completed', 'in-progress', 'planned'],
        default: 'completed'
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


// Modern pre-save middleware (no next())
projectSchema.pre('save', async function () {

    // update timestamp
    this.updatedAt = Date.now();

    // generate slug
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
});


// Indexes for faster queries
projectSchema.index({ featured: -1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ createdAt: -1 });


module.exports = mongoose.model('Project', projectSchema);