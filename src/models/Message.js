const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlength: [50, "Name cannot exceed 50 characters"]
    },
email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
},
company: {
    type: String,
    trim: true,
    maxlength: [50, "Company name must not exceed 50 characters"]
},
message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
},
read: {
    type: Boolean,
    default: false
},
replied: {
    type: Boolean,
    false: false
},
repliedAt: Date,
notes: String,
createdAt: {
    type: Date,
    default: Date.now
},
ip: String,
userAgent: String
});

messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1 });
messageSchema.index({ email: 1 });

module.exports = mongoose.model("Message", messageSchema);