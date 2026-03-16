// Constants used across the application

// Project categories
exports.PROJECT_CATEGORIES = {
    FULLSTACK: 'fullstack',
    FRONTEND: 'frontend',
    BACKEND: 'backend',
    API: 'api'
};

// Lead statuses
exports.LEAD_STATUS = {
    NEW: 'new',
    CONTACTED: 'contacted',
    QUALIFIED: 'qualified',
    NEGOTIATING: 'negotiating',
    CONVERTED: 'converted',
    LOST: 'lost'
};

// Message roles for chat
exports.CHAT_ROLES = {
    USER: 'user',
    BOT: 'bot'
};

// Conversation statuses
exports.CONVERSATION_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    QUALIFIED: 'qualified',
    CLOSED: 'closed'
};

// Intent types for chatbot
exports.INTENT_TYPES = {
    GREETING: 'greeting',
    ECOMMERCE: 'ecommerce',
    TIMELINE: 'timeline',
    PRICING: 'pricing',
    PORTFOLIO: 'portfolio',
    SKILLS: 'skills',
    CONTACT: 'contact',
    LOCATION: 'location',
    EDUCATION: 'education',
    EXPERIENCE: 'experience',
    AVAILABILITY: 'availability',
    THANKS: 'thanks',
    GOODBYE: 'goodbye',
    FALLBACK: 'fallback'
};

// HTTP status codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500
};

// Rate limiting
exports.RATE_LIMITS = {
    CHAT: 100, // messages per hour per IP
    CONTACT: 5, // submissions per day per IP
    ADMIN: 1000 // requests per hour
};

// Cache durations (in seconds)
exports.CACHE_DURATION = {
    PROJECTS: 3600, // 1 hour
    STATS: 300, // 5 minutes
    CONVERSATIONS: 60 // 1 minute
};