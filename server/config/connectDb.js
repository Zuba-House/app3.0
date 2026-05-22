import mongoose from "mongoose";
import { env } from './env.js';

const PRIMARY_URI = env.mongodbUri;
const LOCAL_FALLBACK = env.mongodbLocalUri; // optional local fallback

function printAtlasHints() {
    console.log('\nHelpful tips to connect to MongoDB Atlas:');
    console.log('- Make sure your current IP is whitelisted in the Atlas Network Access (or allow access from anywhere 0.0.0.0/0 for dev).');
    console.log('- Verify the connection string (username, password, and cluster name). If your password has special characters, URL-encode them.');
    console.log('- Use the SRV connection string (starts with mongodb+srv://) or the standard one depending on your Atlas settings.');
    console.log('- See: https://www.mongodb.com/docs/atlas/atlas-access/');
}

const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 10000,
};

async function connectDB() {
    if (!PRIMARY_URI && !LOCAL_FALLBACK) {
        throw new Error(
            'No MongoDB connection string found. Set MONGODB_URI (Atlas) or MONGODB_LOCAL_URI in Render Environment.'
        );
    }

    // Try primary Atlas URI first (if provided)
    if (PRIMARY_URI) {
        try {
            console.log('Attempting MongoDB connection to PRIMARY (Atlas)...');
            await mongoose.connect(PRIMARY_URI, MONGO_OPTIONS);
            console.log('MongoDB connected (PRIMARY)');
            return;
        } catch (err) {
            console.error('Primary MongoDB connection failed:', err?.message || err);
            printAtlasHints();
        }
    }

    // If primary failed or not provided, try local fallback
    if (LOCAL_FALLBACK) {
        try {
            console.log('Attempting MongoDB connection to LOCAL fallback...');
            await mongoose.connect(LOCAL_FALLBACK, MONGO_OPTIONS);
            console.log('MongoDB connected (LOCAL_FALLBACK)');
            return;
        } catch (err) {
            console.error('Local fallback MongoDB connection failed:', err?.message || err);
        }
    }

    throw new Error(
        'Could not connect to MongoDB. Check MONGODB_URI and Atlas Network Access (allow 0.0.0.0/0 for Render).'
    );
}

export default connectDB;