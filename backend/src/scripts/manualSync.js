/**
 * Manual sync script
 * Run with: npm run sync
 */
require('dotenv').config();
const connectDB = require('../config/database');
const { syncJobs } = require('../services/reliefwebSync');

const runSync = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Starting manual sync...');
        const stats = await syncJobs();

        console.log('Sync completed successfully!');
        console.log('Stats:', JSON.stringify(stats, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error.message);
        process.exit(1);
    }
};

runSync();
