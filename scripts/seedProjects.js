const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Force DNS to use Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
console.log('✅ DNS configured to use:', dns.getServers());

const Project = require('../src/models/Project');

const projects = [
    {
        title: "General Health Support Platform",
        shortDescription: "Full-stack health-focused web application with RESTful APIs",
        description: "A comprehensive health support platform built with the MERN stack. Features include user authentication, health tips, appointment scheduling, and API documentation with Swagger UI.",
        category: "fullstack",
        technologies: [ "React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JWT", "Swagger UI" ],
        imageUrl: "https://via.placeholder.com/600x400/964B2F/ffffff?text=Health+Platform",
        githubUrl: "https://github.com/blesose/general-health-support",
        liveUrl: "https://health-platform-demo.vercel.app",
        featured: true,
        completionDate: new Date("2025-06-15"),
        highlights: [
            "RESTful API with Swagger documentation",
            "Responsive React frontend with Tailwind CSS",
            "MongoDB database with Mongoose ODM",
            "User authentication and authorization"
        ],
        status: "completed"
    },
    {
        title: "Tatt - Time Tracking & Task Management SaaS",
        shortDescription: "Dark-mode-first task and time tracking system with authentication",
        description: "A SaaS application for tracking time and managing tasks. Features include user authentication, project-based time tracking, detailed reports, and a beautiful dark-mode-first UI.",
        category: "fullstack",
        technologies: ["React", "Tailwind CSS" ],
        imageUrl: "https://via.placeholder.com/600x400/964B2F/ffffff?text=Tatt+SaaS",
        githubUrl: "https://github.com/blesose/TATT",
        liveUrl: "https://tatt-demo.vercel.app",
        featured: true,
        completionDate: new Date("2025-08-20"),
        highlights: [
            "JWT authentication for secure access",
            "Real-time time tracking",
            "Detailed analytics and reports",
            "Dark mode by default"
        ],
        status: "completed"
    },
    {
        title: "Number Plate Generator System",
        shortDescription: "Web-based number plate generation system with API integration",
        description: "A web application that generates custom number plates. Features include plate design customization, preview functionality, and backend logic for plate validation and storage.",
        category: "fullstack",
        technologies: [ "Node.js", "Express", "MongoDB" ],
        imageUrl: "https://via.placeholder.com/600x400/964B2F/ffffff?text=Number+Plate",
        githubUrl: "https://github.com/blesose/VehiclePlate",
        liveUrl: "https://number-plate-demo.vercel.app",
        featured: false,
        completionDate: new Date("2025-04-10"),
        highlights: [
            // "Custom plate design interface",
            "Real-time preview",
            "Backend validation logic",
            "Export functionality"
        ],
        status: "completed"
    }
];

// Generate slugs explicitly
const projectsWithSlugs = projects.map(project => {
    const slug = project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    
    console.log(`📝 Generated slug for "${project.title}":`, slug);
    
    return {
        ...project,
        slug: slug
    };
});

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing projects
        await Project.deleteMany({});
        console.log('📝 Cleared existing projects');

        // Insert projects one by one to see which fails
        for (const project of projectsWithSlugs) {
            console.log(`\n📌 Attempting to insert: ${project.title}`);
            console.log('   Project data:', JSON.stringify(project, null, 2));
            
            const newProject = new Project(project);
            await newProject.save();
            console.log(`   ✅ Inserted: ${project.title} (slug: ${newProject.slug})`);
        }

        // Count projects
        const count = await Project.countDocuments();
        console.log(`\n📊 Total projects in database: ${count}`);

        // Log all inserted projects
        const insertedProjects = await Project.find();
        console.log('\n📋 All inserted projects:');
        insertedProjects.forEach(p => {
            console.log(`   - ${p.title} (slug: ${p.slug})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        
        // If there was an error, check what's in the database
        const count = await Project.countDocuments();
        console.log(`\n📊 Projects in database before error: ${count}`);
        
        process.exit(1);
    }
};

seedDatabase();