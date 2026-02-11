/**
 * Cleanup Script
 * - Removes fake seed data from the database
 * - Drops stale unique index on applyUrl (was removed from schema)
 * Run with: node src/scripts/cleanup.js
 */
require('dotenv').config();
const connectDB = require('../config/database');
const Job = require('../models/Job');

const cleanup = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // 1. Remove seed/sample jobs
        console.log('\n--- Removing seed data ---');
        const seedResult = await Job.deleteMany({
            $or: [
                { source: 'sample' },
                { sourceId: { $regex: /^sample-/ } },
                { applyUrl: { $regex: /\/sample-/ } }
            ]
        });
        console.log(`Removed ${seedResult.deletedCount} seed jobs`);

        // 2. Remove expired jobs (closing date has passed)
        console.log('\n--- Removing expired jobs ---');
        const expiredResult = await Job.deleteMany({
            closingDate: { $lt: new Date() },
            closingDate: { $ne: null }
        });
        console.log(`Removed ${expiredResult.deletedCount} expired jobs`);

        // 3. Drop stale unique index on applyUrl if it exists
        console.log('\n--- Dropping stale applyUrl unique index ---');
        try {
            const indexes = await Job.collection.indexes();
            const applyUrlIndex = indexes.find(idx =>
                idx.key && idx.key.applyUrl && idx.unique
            );
            if (applyUrlIndex) {
                await Job.collection.dropIndex(applyUrlIndex.name);
                console.log(`Dropped stale index: ${applyUrlIndex.name}`);
            } else {
                console.log('No stale applyUrl unique index found');
            }
        } catch (err) {
            console.log('Index drop skipped:', err.message);
        }

        // 4. Summary
        const totalJobs = await Job.countDocuments();
        const bySource = await Job.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log(`\n✅ Cleanup complete!`);
        console.log(`Total jobs remaining: ${totalJobs}`);
        console.log('Jobs by source:');
        bySource.forEach(s => console.log(`  ${s._id || 'unknown'}: ${s.count}`));

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error.message);
        process.exit(1);
    }
};

cleanup();
