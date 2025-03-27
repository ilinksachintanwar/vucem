#!/usr/bin/env node

const ParallelRunner = require('../utils/ParallelRunner');
const Logger = require('../utils/Logger');
const fs = require('fs');
const path = require('path');

const logger = new Logger('ParallelRunner');

// Create reports directory if it doesn't exist
const reportsDir = path.resolve(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
let folders = [];
let maxWorkers = 0;

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--folders' || arg === '-f' || arg === '--features') {
    // Get folders from the next argument
    if (i + 1 < args.length) {
      folders = args[i + 1].split(',');
      i++; // Skip the next argument
    }
  } else if (arg === '--workers' || arg === '-w') {
    // Get max workers from the next argument
    if (i + 1 < args.length) {
      maxWorkers = parseInt(args[i + 1], 10);
      i++; // Skip the next argument
    }
  } else if (arg === '--help' || arg === '-h') {
    // Show help
    console.log(`
Usage: node run-parallel.js [options]

Options:
  --folders, -f <folders>  Comma-separated list of folders to run tests from
  --features <folders>     Alias for --folders
  --workers, -w <number>   Maximum number of parallel workers (default: all folders)
  --help, -h               Show this help message
    `);
    process.exit(0);
  } else if (arg === '--') {
    // Skip the -- argument and treat the next argument as folders
    if (i + 1 < args.length) {
      // If the next argument is "features", it means run all folders
      if (args[i + 1] === 'features') {
        // Just run all folders
        i++; // Skip the next argument
      } else if (i + 2 < args.length) {
        // If there's another argument after "features", it's a specific folder
        folders = [args[i + 2]];
        i += 2; // Skip the next two arguments
      }
    }
  }
}

// Handle Ctrl+C to gracefully terminate all processes
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  ParallelRunner.killAll();
  process.exit(1);
});

// Format time in minutes and seconds
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Run the tests
async function run() {
  try {
    const startTime = Date.now();
    let result;
    
    if (folders.length > 0) {
      // Run tests for specific folders
      logger.info(`Running tests for folders: ${folders.join(', ')}`);
      
      // If maxWorkers is specified, run in batches
      if (maxWorkers > 0 && maxWorkers < folders.length) {
        logger.info(`Using ${maxWorkers} workers for ${folders.length} folders`);
        
        // Run in batches
        const batches = [];
        for (let i = 0; i < folders.length; i += maxWorkers) {
          batches.push(folders.slice(i, i + maxWorkers));
        }
        
        let allPassed = true;
        const allResults = [];
        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let skippedScenarios = 0;
        
        for (let i = 0; i < batches.length; i++) {
          logger.info(`Running batch ${i + 1} of ${batches.length}: ${batches[i].join(', ')}`);
          const batchResult = await ParallelRunner.runSpecificFolders(batches[i]);
          allPassed = allPassed && batchResult.success;
          allResults.push(...batchResult.folderResults);
          
          // Accumulate scenario counts
          totalScenarios += batchResult.scenarioCounts.total;
          passedScenarios += batchResult.scenarioCounts.passed;
          failedScenarios += batchResult.scenarioCounts.failed;
          skippedScenarios += batchResult.scenarioCounts.skipped;
        }
        
        result = {
          success: allPassed,
          folderResults: allResults,
          scenarioCounts: {
            total: totalScenarios,
            passed: passedScenarios,
            failed: failedScenarios,
            skipped: skippedScenarios
          }
        };
      } else {
        // Run all folders in parallel
        result = await ParallelRunner.runSpecificFolders(folders);
      }
    } else {
      // Run all folders
      logger.info('Running tests for all folders');
      result = await ParallelRunner.runParallel();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log results
    console.log('\n');
    console.log('='.repeat(80));
    console.log(`TEST EXECUTION SUMMARY`);
    console.log('='.repeat(80));
    console.log(`Duration: ${formatTime(duration)}`);
    console.log(`Overall result: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`Total scenarios: ${result.scenarioCounts.total}`);
    console.log(`Passed: ${result.scenarioCounts.passed}`);
    console.log(`Failed: ${result.scenarioCounts.failed}`);
    console.log(`Skipped: ${result.scenarioCounts.skipped}`);
    console.log('-'.repeat(80));
    console.log('FOLDER RESULTS:');
    
    result.folderResults.forEach(folderResult => {
      const counts = folderResult.scenarioCounts;
      console.log(`${folderResult.folder}: ${folderResult.success ? 'PASS' : 'FAIL'} - ${counts.total} scenarios (${counts.passed} passed, ${counts.failed} failed, ${counts.skipped} skipped)`);
    });
    
    console.log('='.repeat(80));
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    logger.error(`Error running tests: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Start the test run
run(); 