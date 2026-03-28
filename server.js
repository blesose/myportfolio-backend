const express = require("express");
require("dotenv").config();

// ** DNS CONFIGURATION - FIX FOR ECONNREFUSED **
const dns = require('dns');
try {
    // Set DNS servers explicitly to Google DNS
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    // Force IPv4 resolution order
    dns.setDefaultResultOrder('ipv4first');
    console.log('✅ DNS configured to use:', dns.getServers());
} catch (err) {
    console.log('⚠️ DNS configuration error:', err.message);
}

const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

const chatRouter = require("./src/routes/chat");
const projectRouter = require("./src/routes/projects");
const adminRouter = require("./src/routes/admin");
const contactRouter = require("./src/routes/contact");
const resumeRouter = require("./src/routes/resume");

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan("dev"));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
             'http://localhost:5173',
             'https://portfolio-k8fz.onrender.com'

        ];
        
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/contact", contactRouter);
app.use("/api/chat", chatRouter);
app.use("/api/projects", projectRouter);
app.use("/api/resume", resumeRouter);

app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Blessing Oga Portfolio API is running",
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Blessing Oga Portfolio API 🤺🤺🤺",
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("💥 Error caught:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

const PORT = process.env.PORT;

// Connect to database and then start server
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ Database successfully connected");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
})
.catch(err => {
    console.error("❌ Database not connected:", err.message);
    process.exit(1);
});