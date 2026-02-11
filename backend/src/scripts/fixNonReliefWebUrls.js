/**
 * Fix Non-ReliefWeb Apply URLs
 * The previous migration incorrectly changed RemoteOK, Remotive, and other
 * source URLs to reliefweb.int format. This script restores them.
 * Run with: node src/scripts/fixNonReliefWebUrls.js
 */
require('dotenv').config();
const connectDB = require('../config/database');
const Job = require('../models/Job');

const URL_PATTERNS = {
    'remoteok': (id) => `https://remoteok.com/l/${id}`,
    'remotive': (id) => `https://remotive.com/remote-jobs/redirect/${id}`,
    'arbeitnow': (id) => `https://www.arbeitnow.com/view/${id}`,
    'sample': (id) => null, // Seed data — leave as-is or remove
};

const fixNonReliefWebUrls = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // Find jobs whose sourceId has a non-numeric prefix (e.g., remoteok-12345)
        // but applyUrl points to reliefweb.int (which is wrong for these)
        const jobs = await Job.find({
            sourceId: { $regex: /^[a-zA-Z]/ }, // Starts with a letter (not pure numeric)
            applyUrl: { $regex: /reliefweb\.int/ }
        });

        console.log(`Found ${jobs.length} non-ReliefWeb jobs with incorrect reliefweb.int URLs\n`);

        let fixed = 0;
        let removed = 0;
        let skipped = 0;

        for (const job of jobs) {
            // Extract source prefix and ID: "remoteok-12345" → ["remoteok", "12345"]
            const parts = job.sourceId.match(/^([a-zA-Z]+)-(.+)$/);

            if (!parts) {
                console.log(`  SKIP: "${job.title}" - can't parse sourceId: ${job.sourceId}`);
                skipped++;
                continue;
            }

            const [, source, id] = parts;
            const urlBuilder = URL_PATTERNS[source];

            if (urlBuilder) {
                const newUrl = urlBuilder(id);
                if (newUrl) {
                    console.log(`  FIX: "${job.title.substring(0, 50)}..."`);
                    console.log(`    ${job.applyUrl} → ${newUrl}`);
                    job.applyUrl = newUrl;
                    await job.save();
                    fixed++;
                } else {
                    // Seed data — remove or skip
                    console.log(`  SEED: "${job.title}" - seed data, removing`);
                    await Job.deleteOne({ _id: job._id });
                    removed++;
                }
            } else {
                // Unknown source — use Google search as fallback
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.organization + ' apply')}`;
                console.log(`  FALLBACK: "${job.title.substring(0, 50)}..." → Google search`);
                job.applyUrl = searchUrl;
                await job.save();
                fixed++;
            }
        }

        console.log(`\n✅ Fix complete!`);
        console.log(`   Fixed:   ${fixed}`);
        console.log(`   Removed: ${removed} (seed data)`);
        console.log(`   Skipped: ${skipped}`);

        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error.message);
        process.exit(1);
    }
};

fixNonReliefWebUrls();
