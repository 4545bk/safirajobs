/**
 * Manual script to test real job scrapers
 * Run with: node scripts/testScrapers.js
 */

const mongoose = require('mongoose');
const { syncEthioJobs } = require('../src/services/ethioJobsSync');
const { syncIndeedJobs } = require('../src/services/indeedSync');
const { syncJobs: syncReliefWeb } = require('../src/services/reliefwebSync');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safirajobs';

async function testScrapers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!\n');

        console.log('='.repeat(50));
        console.log('TESTING REAL JOB SCRAPERS');
        console.log('='.repeat(50));

        // Test EthioJobs
        console.log('\n1️⃣  Testing EthioJobs.net scraper...');
        const ethioResults = await syncEthioJobs();
        console.log('EthioJobs Result:', ethioResults);

        // Test Indeed
        console.log('\n2️⃣  Testing Indeed Ethiopia scraper...');
        const indeedResults = await syncIndeedJobs();
        console.log('Indeed Result:', indeedResults);

        // Test ReliefWeb
        console.log('\n3️⃣  Testing ReliefWeb API...');
        const reliefResults = await syncReliefWeb();
        console.log('ReliefWeb Result:', reliefResults);

        // Show total
        const Job = require('../src/models/Job');
        const totalJobs = await Job.countDocuments();
        const bySource = await Job.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);

        console.log('\n' + '='.repeat(50));
        console.log('📊 FINAL RESULTS');
        console.log('='.repeat(50));
        console.log(`Total Jobs: ${totalJobs}`);
        console.log('\nBy Source:');
        bySource.forEach(s => console.log(`  ${s._id}: ${s.count} jobs`));

        await mongoose.connection.close();
        console.log('\n✅ Test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testScrapers();
