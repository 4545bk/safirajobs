/**
 * Fix Apply URLs Migration Script
 * Updates all existing jobs to use reliable ReliefWeb URLs
 * Run with: node src/scripts/fixApplyUrls.js
 */
require('dotenv').config();
const connectDB = require('../config/database');
const Job = require('../models/Job');

const fixApplyUrls = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // Find all jobs that have a sourceId (from ReliefWeb) but don't use reliefweb.int URLs
        const jobs = await Job.find({
            sourceId: { $exists: true, $ne: null },
            applyUrl: { $not: /reliefweb\.int\/job\// }
        });

        console.log(`Found ${jobs.length} jobs with non-ReliefWeb apply URLs`);

        let updated = 0;
        let errors = 0;

        for (const job of jobs) {
            try {
                const newUrl = `https://reliefweb.int/job/${job.sourceId}`;
                console.log(`  ${job.title.substring(0, 50)}...`);
                console.log(`    OLD: ${job.applyUrl}`);
                console.log(`    NEW: ${newUrl}`);

                job.applyUrl = newUrl;
                await job.save();
                updated++;
            } catch (err) {
                console.error(`  ERROR updating "${job.title}": ${err.message}`);
                errors++;
            }
        }

        // Also fix any jobs with empty/invalid applyUrls
        const emptyUrlJobs = await Job.find({
            sourceId: { $exists: true, $ne: null },
            $or: [
                { applyUrl: '' },
                { applyUrl: null },
                { applyUrl: { $exists: false } }
            ]
        });

        console.log(`\nFound ${emptyUrlJobs.length} jobs with empty/missing apply URLs`);

        for (const job of emptyUrlJobs) {
            try {
                job.applyUrl = `https://reliefweb.int/job/${job.sourceId}`;
                await job.save();
                updated++;
            } catch (err) {
                errors++;
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Errors:  ${errors}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

fixApplyUrls();
