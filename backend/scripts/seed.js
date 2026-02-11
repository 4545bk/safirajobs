/**
 * Script to seed the database with sample jobs
 * Run with: node scripts/seed.js
 */

const mongoose = require('mongoose');
const { seedJobs, clearSampleJobs } = require('../src/services/seedData');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safirajobs';

async function runSeed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Successfully\n');

        // Clear existing sample data
        console.log('Clearing existing sample jobs...');
        const deleted = await clearSampleJobs();
        console.log(`Deleted ${deleted} existing sample jobs\n`);

        // Seed new data
        console.log('Seeding new jobs...');
        const stats = await seedJobs();
        console.log('\n✅ Seeding complete!');
        console.log(`Inserted: ${stats.inserted}`);
        console.log(`Updated: ${stats.updated}`);
        console.log(`Skipped: ${stats.skipped}`);

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

runSeed();
