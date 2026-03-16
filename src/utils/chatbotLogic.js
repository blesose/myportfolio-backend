class ChatbotLogic {
    constructor() {
        this.context = {};
        this.conversationState = {};
    }

    // Intent patterns
    intents = {
        greeting: {
            patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
            responses: [
                "Hello! 👋 I'm Blessing's virtual assistant. How can I help you today?",
                "Hi there! Thanks for reaching out. What would you like to know about Blessing's work?",
                "Hey! Great to meet you. I can tell you all about Blessing's skills and projects. What are you interested in?"
            ]
        },
        
        ecommerce: {
            patterns: [
                'ecommerce', 'e-commerce', 'online store', 'shop', 'selling products',
                'build an ecommerce', 'create an online store', 'shopping website',
                'product catalog', 'payment integration', 'cart', 'checkout'
            ],
            responses: [
                "I specialize in building e-commerce solutions with the MERN stack! During my training at IT Skill Center, I built similar applications with features like product catalogs, shopping carts, and payment integration. Would you like to discuss your specific e-commerce requirements?",
                "Great choice! I can build you a fully functional e-commerce website using React for the frontend and Node.js for the backend. Some features I can implement: product management, user authentication, shopping cart, order processing, and payment gateway integration. What kind of products will you be selling?",
                "I have experience building e-commerce platforms. My 'General Health Support Platform' project has similar architecture. I can create a custom solution with inventory management, user accounts, and secure checkout. Tell me more about your business!"
            ]
        },
        
        timeline: {
            patterns: [
                'how long', 'timeframe', 'timeline', 'how many weeks', 'how many months',
                'when can you finish', 'delivery time', 'completion time', 'deadline'
            ],
            responses: [
                "Based on my experience, a basic e-commerce website typically takes 4-6 weeks. More complex projects with custom features may take 8-10 weeks. I can provide a more accurate timeline after understanding your specific requirements. What features are most important to you?",
                "Project timelines depend on complexity. A simple business website might take 3-4 weeks, while a full-featured e-commerce platform could take 6-8 weeks. I always provide regular updates and work iteratively so you can see progress. What's your ideal timeline?",
                "I'm committed to delivering quality work efficiently. Most projects I've worked on during my training were completed within 4-8 weeks. I can work with your schedule and provide a detailed project plan with milestones. When would you like to launch?"
            ]
        },
        
        pricing: {
            patterns: [
                'cost', 'price', 'how much', 'budget', 'rates', 'pricing',
                'what do you charge', 'fee', 'payment', 'expensive', 'affordable'
            ],
            responses: [
                "As a junior developer, I offer very competitive rates while delivering professional-quality work. My hourly rate is $XX, or I can provide a fixed project quote. For an e-commerce site, typical projects range from $XXX - $XXX depending on features. Would you like a detailed estimate?",
                "I believe in transparent pricing. I'm happy to discuss your budget and create a solution that works for you. My rates are flexible, and I'm open to discussing payment plans. What's your budget range for this project?",
                "I focus on delivering maximum value at affordable rates. Since I'm building my portfolio, I offer competitive pricing without compromising on quality. Let's schedule a call to discuss your budget and needs in detail."
            ]
        },
        
        portfolio: {
            patterns: [
                'portfolio', 'projects', 'work samples', 'examples', 'show me',
                'what have you built', 'past work', 'previous projects', 'github'
            ],
            responses: [
                "I'm glad you asked! I've built several projects including:\n\n• General Health Support Platform - A full-stack health application with REST APIs\n• Tatt - Time Tracking & Task Management SaaS with authentication\n• Number Plate Generator System - Web-based generation tool\n\nAll are on my GitHub (github.com/blesose). Would you like details about any specific project?",
                "Here are my main projects:\n\n1. General Health Support Platform (MERN stack)\n2. Tatt - Time Tracking SaaS\n3. Number Plate Generator System\n\nEach project demonstrates different aspects of my skills. Which one would you like to know more about?",
                "You can check out all my projects on GitHub: https://github.com/blesose\n\nI've worked on full-stack applications with features like user authentication, API documentation with Swagger, responsive design with Tailwind CSS, and database integration. Any particular type of project you're interested in?"
            ]
        },
        
        skills: {
            patterns: [
                'skills', 'technologies', 'tech stack', 'what do you know',
                'experience with', 'familiar with', 'proficient in', 'tools'
            ],
            responses: [
                "I specialize in the MERN stack: MongoDB, Express.js, React, and Node.js. I'm also proficient with Tailwind CSS for responsive design, Git for version control, Postman for API testing, and Swagger for API documentation. I have hands-on experience building full-stack applications from scratch.",
                "My technical toolkit includes:\n\n✅ Frontend: React.js, Tailwind CSS, JavaScript (ES6+)\n✅ Backend: Node.js, Express.js\n✅ Database: MongoDB, Mongoose\n✅ Tools: Git, GitHub, Postman, Swagger UI, Firebase, Vite\n\nI'm comfortable working across the entire stack and love learning new technologies!"
            ]
        },
        
        contact: {
            patterns: [
                'contact', 'reach you', 'email', 'phone', 'call', 'message',
                'get in touch', 'discuss', 'meeting', 'talk', 'schedule'
            ],
            responses: [
                "You can reach me directly at:\n📧 Email: codesose.dev@gmail.com\n📱 Phone: +2347084752971\n💼 LinkedIn: linkedin.com/in/blessing-oga-53bb443a7/\n\nI typically respond within 24 hours. Would you like me to schedule a call to discuss your project?",
                "I'd love to discuss your project further! Here's my contact info:\n\nEmail: codesose.dev@gmail.com\nPhone: +2347084752971\n\nWhat's the best way to reach you? I can also send you more information via email if you prefer."
            ]
        },
        
        location: {
            patterns: [
                'location', 'where are you', 'based in', 'country', 'nigeria',
                'remote', 'timezone', 'available'
            ],
            responses: [
                "I'm based in Nigeria (West African Time - WAT), but I'm fully equipped to work remotely with clients anywhere in the world. I'm flexible with time zones and can adjust my schedule to accommodate your preferred working hours.",
                "I'm located in Nigeria, but I specialize in remote collaboration. I have experience working with distributed teams and use tools like Git, Slack, and Zoom for seamless communication regardless of location."
            ]
        },
        
        education: {
            patterns: [
                'education', 'study', 'degree', 'training', 'qualification',
                'background', 'school', 'university', 'certification'
            ],
            responses: [
                "I'm currently studying Computer Engineering at Lagos State University of Science and Technology (LASUSTECH). I've also completed professional training in Full Stack Development at IT Skill Center/Tech Academy (Feb 2025 - Nov 2025), where I got hands-on experience building real applications.",
                "My educational background:\n\n🎓 B.Eng. Computer Engineering - LASUSTECH (in progress)\n💻 Full Stack Development Certification - IT Skill Center/Tech Academy\n\nThis combination gives me both theoretical knowledge and practical development skills."
            ]
        },
        
        experience: {
            patterns: [
                'experience', 'work history', 'job', 'employed', 'worked',
                'professional background', 'years of experience'
            ],
            responses: [
                "I'm a Junior Full Stack Developer with hands-on experience from intensive training at IT Skill Center/Tech Academy (Feb 2025 - Nov 2025). During this time, I built multiple full-stack applications, documented APIs with Swagger, and collaborated using Git. I'm now seeking opportunities to contribute to real-world projects.",
                "While I'm at the early stage of my professional journey, I've invested heavily in practical training. I've completed several full-stack projects independently, which you can see on my GitHub. I'm eager to bring my skills and enthusiasm to a development team!"
            ]
        },
        
        availability: {
            patterns: [
                'available', 'free', 'hire', 'looking for work', 'open to',
                'opportunities', 'job', 'position', 'internship', 'remote'
            ],
            responses: [
                "Yes, I'm actively seeking junior developer, internship, and remote opportunities! I'm available to start immediately and excited to contribute to a collaborative team. Are you hiring or looking for a developer for a project?",
                "I'm currently open to full-time, part-time, and contract opportunities. I'm particularly interested in roles where I can work with the MERN stack and grow as a developer. Do you have a specific opportunity in mind?"
            ]
        },
        
        thanks: {
            patterns: ['thank', 'thanks', 'appreciate', 'grateful'],
            responses: [
                "You're welcome! 😊 Let me know if you have any other questions.",
                "Happy to help! Feel free to ask anything else about my skills or projects.",
                "My pleasure! I'm here whenever you need more information."
            ]
        },
        
        goodbye: {
            patterns: ['bye', 'goodbye', 'see you', 'talk later', 'end chat'],
            responses: [
                "Thanks for chatting! Feel free to reach out anytime. Have a great day! 👋",
                "Goodbye! Don't hesitate to contact me if you have more questions.",
                "Take care! I hope to hear from you soon about your project."
            ]
        },
        
        fallback: {
            responses: [
                "I'm not sure I understood that completely. Could you rephrase your question? I'm here to help with information about Blessing's skills, projects, experience, or how to get in touch.",
                "I want to make sure I help you properly. Are you asking about e-commerce development, project timelines, pricing, or something else? Feel free to be more specific!",
                "Thanks for your question! To give you the best answer, could you provide a bit more detail? I can help with project inquiries, technical questions, or scheduling a consultation."
            ]
        }
    };

    // Analyze message intent
    analyzeIntent(message) {
        const lowerMsg = message.toLowerCase().trim();
        
        // Check each intent pattern
        for (const [intent, data] of Object.entries(this.intents)) {
            if (intent === 'fallback') continue;
            
            for (const pattern of data.patterns) {
                if (lowerMsg.includes(pattern)) {
                    return intent;
                }
            }
        }
        
        // Check for multiple keywords (more sophisticated matching)
        const words = lowerMsg.split(' ');
        
        // E-commerce detection (multiple related words)
        const ecommerceKeywords = ['store', 'shop', 'product', 'sell', 'buy', 'cart', 'checkout', 'payment'];
        const ecommerceMatch = ecommerceKeywords.filter(k => lowerMsg.includes(k)).length;
        if (ecommerceMatch >= 2) return 'ecommerce';
        
        // Project discussion detection
        const projectKeywords = ['project', 'build', 'develop', 'create', 'website', 'app', 'application'];
        const projectMatch = projectKeywords.filter(k => lowerMsg.includes(k)).length;
        if (projectMatch >= 2) return 'portfolio';
        
        return 'fallback';
    }

    // Generate response based on intent
    generateResponse(intent, message, conversationHistory = []) {
        const intentData = this.intents[intent] || this.intents.fallback;
        const responses = intentData.responses;
        
        // Select random response from matching intent
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Personalize response based on context
        if (intent === 'ecommerce') {
            // Add specific questions to gather requirements
            const followUp = " To help you better, could you tell me: 1) What type of products you'll sell? 2) Do you need payment integration? 3) Any specific features you have in mind?";
            response += followUp;
        }
        
        if (intent === 'pricing' && !message.includes('estimate')) {
            response += " Would you like me to prepare a detailed estimate based on your specific requirements?";
        }
        
        return response;
    }

    // Check if message indicates a potential lead
    isPotentialLead(message, intent) {
        const lowerMsg = message.toLowerCase();
        
        // High-value indicators
        const leadIndicators = [
            'hire', 'project', 'build', 'develop', 'create', 'website',
            'business', 'company', 'client', 'customer', 'work together',
            'interested in', 'want to', 'need a', 'looking for'
        ];
        
        const score = leadIndicators.filter(ind => lowerMsg.includes(ind)).length;
        
        // If intent is pricing, ecommerce, or timeline with high score
        if (['pricing', 'ecommerce', 'timeline'].includes(intent) && score >= 2) {
            return true;
        }
        
        return score >= 3;
    }

    // Extract requirements from message
    extractRequirements(message) {
        const requirements = {
            projectType: null,
            budget: null,
            timeline: null,
            features: []
        };
        
        const lowerMsg = message.toLowerCase();
        
        // Detect project type
        if (lowerMsg.includes('ecommerce') || lowerMsg.includes('store') || lowerMsg.includes('shop')) {
            requirements.projectType = 'ecommerce';
        } else if (lowerMsg.includes('blog') || lowerMsg.includes('content')) {
            requirements.projectType = 'blog';
        } else if (lowerMsg.includes('portfolio')) {
            requirements.projectType = 'portfolio';
        } else if (lowerMsg.includes('dashboard') || lowerMsg.includes('admin')) {
            requirements.projectType = 'dashboard';
        }
        
        // Extract potential budget
        const budgetMatch = message.match(/\$?(\d+)[kK]?/);
        if (budgetMatch) {
            requirements.budget = budgetMatch[0];
        }
        
        // Extract timeline
        const timelineMatch = message.match(/(\d+)\s*(week|month|day)/i);
        if (timelineMatch) {
            requirements.timeline = timelineMatch[0];
        }
        
        // Extract features (common patterns)
        const featureKeywords = ['payment', 'login', 'admin', 'api', 'mobile', 'responsive'];
        requirements.features = featureKeywords.filter(f => lowerMsg.includes(f));
        
        return requirements;
    }
}

module.exports = new ChatbotLogic();