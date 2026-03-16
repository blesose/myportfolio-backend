const mongoose = require("mongoose");
const { createIndexes } = require("e:/MyLab backend/mylab-backend/src/modules/labInsights/models/labInsights.model");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Database connected: ${ conn.connection.host}`);

        await createIndexes();
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
    const createIndexes = async () => {
        try {
            // Ensure indexes for better query performance
            const db = mongoose.connection;
            
            // Projects collection indexes
            await db.collection('projects').createIndex({ featured: 1 });
            await db.collection('projects').createIndex({ technologies: 1 });
            
            // Messages collection indexes
            await db.collection('messages').createIndex({ createdAt: -1 });
            await db.collection('messages').createIndex({ read: 1 });
            
            // Conversations collection indexes
            await db.collection('conversations').createIndex({ updatedAt: -1 });
            await db.collection('conversations').createIndex({ isLead: 1 });
            
            console.log('✅ Database indexes created');
        } catch (error) {
            console.log("error creating indexes", error)
        }
    };

    module.exports = connectDB;
