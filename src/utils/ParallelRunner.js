const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class ParallelRunner {
  constructor() {
    this.logger = new Logger('ParallelRunner');
    this.featuresDir = path.resolve(__dirname, '../../features');
    this.processes = [];
    this.results = {};
    this.scenarioCounts = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  /**
   * Get all feature folders
   * @returns {Array} List of feature folders
   */
  getFeatureFolders() {
    try {
      // Get all items in the features directory
      const items = fs.readdirSync(this.featuresDir);
      
      // Filter to only include directories
      const folders = items.filter(item => {
        const itemPath = path.join(this.featuresDir, item);
        return fs.statSync(itemPath).isDirectory();
      });
      
      this.logger.info(`Found feature folders: ${folders.join(', ')}`);
      return folders;
    } catch (error) {
      this.logger.error(`Failed to get feature folders: ${error.message}`);
      return [];
    }
  }

  /**
   * Get feature files in a folder
   * @param {string} folder - Folder name
   * @returns {Array} List of feature files
   */
  getFeatureFiles(folder) {
    try {
      const folderPath = path.join(this.featuresDir, folder);
      
      // Get all files in the folder
      const files = fs.readdirSync(folderPath);
      
      // Filter to only include .feature files
      const featureFiles = files.filter(file => file.endsWith('.feature'))
        .map(file => path.join(folderPath, file));
      
      this.logger.info(`Found feature files in ${folder}: ${featureFiles.length}`);
      return featureFiles;
    } catch (error) {
      this.logger.error(`Failed to get feature files in ${folder}: ${error.message}`);
      return [];
    }
  }

  /**
   * Count scenarios in a feature file
   * @param {string} featureFile - Path to feature file
   * @returns {number} Number of scenarios
   */
  countScenariosInFile(featureFile) {
    try {
      const content = fs.readFileSync(featureFile, 'utf8');
      // Count lines that start with "Scenario:" or "Scenario Outline:"
      const scenarioCount = (content.match(/^\s*Scenario:|\s*Scenario Outline:/gm) || []).length;
      return scenarioCount;
    } catch (error) {
      this.logger.error(`Failed to count scenarios in ${featureFile}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Count total scenarios in a folder
   * @param {string} folder - Folder name
   * @returns {number} Total number of scenarios
   */
  countScenariosInFolder(folder) {
    const featureFiles = this.getFeatureFiles(folder);
    let totalScenarios = 0;
    
    featureFiles.forEach(file => {
      const scenariosInFile = this.countScenariosInFile(file);
      totalScenarios += scenariosInFile;
    });
    
    this.logger.info(`Total scenarios in ${folder}: ${totalScenarios}`);
    return totalScenarios;
  }

  /**
   * Parse cucumber output to get scenario counts
   * @param {string} output - Cucumber output
   * @returns {object} Scenario counts
   */
  parseScenarioCounts(output) {
    try {
      // Look for the summary line like "5 scenarios (2 failed, 3 passed)"
      const summaryMatch = output.match(/(\d+)\s+scenarios?\s+\(([^)]+)\)/);
      
      if (summaryMatch) {
        const total = parseInt(summaryMatch[1], 10);
        const details = summaryMatch[2];
        
        // Parse the details
        const failed = (details.match(/(\d+)\s+failed/) || [0, 0])[1];
        const passed = (details.match(/(\d+)\s+passed/) || [0, 0])[1];
        const skipped = (details.match(/(\d+)\s+skipped/) || [0, 0])[1];
        const pending = (details.match(/(\d+)\s+pending/) || [0, 0])[1];
        const undefined = (details.match(/(\d+)\s+undefined/) || [0, 0])[1];
        
        return {
          total,
          failed: parseInt(failed, 10),
          passed: parseInt(passed, 10),
          skipped: parseInt(skipped, 10) + parseInt(pending, 10) + parseInt(undefined, 10)
        };
      }
      
      return {
        total: 0,
        failed: 0,
        passed: 0,
        skipped: 0
      };
    } catch (error) {
      this.logger.error(`Failed to parse scenario counts: ${error.message}`);
      return {
        total: 0,
        failed: 0,
        passed: 0,
        skipped: 0
      };
    }
  }

  /**
   * Run tests in a folder
   * @param {string} folder - Folder name
   * @returns {Promise} Promise that resolves when all tests in the folder are complete
   */
  runFolderTests(folder) {
    return new Promise((resolve) => {
      const featureFiles = this.getFeatureFiles(folder);
      
      if (featureFiles.length === 0) {
        this.logger.warn(`No feature files found in ${folder}`);
        resolve({ 
          folder, 
          success: true, 
          message: 'No feature files found',
          scenarioCounts: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
          }
        });
        return;
      }
      
      // Count expected scenarios
      const expectedScenarios = this.countScenariosInFolder(folder);
      
      // Run all feature files in the folder as a single command
      // This ensures they run sequentially within the folder
      
      // Prepare the command with JSON formatter for better parsing
      const cmd = 'npx';
      const args = [
        'cucumber-js', 
        ...featureFiles,
        '--format', 
        '@cucumber/pretty-formatter',
        '--format',
        'json:reports/cucumber-report-' + folder + '.json'
      ];
      
      // Add environment variables
      const env = {
        ...process.env,
        FOLDER_NAME: folder
      };
      
      this.logger.info(`Starting tests for folder: ${folder} with ${featureFiles.length} feature files (${expectedScenarios} scenarios)`);
      
      // Spawn the process
      const proc = spawn(cmd, args, { 
        env,
        shell: true,
        stdio: 'pipe'
      });
      
      let output = '';
      
      // Capture stdout
      proc.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(`[${folder}] ${text}`);
      });
      
      // Capture stderr
      proc.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stderr.write(`[${folder}] ${text}`);
      });
      
      // Handle process completion
      proc.on('close', (code) => {
        const success = code === 0;
        
        // Parse scenario counts from output
        const scenarioCounts = this.parseScenarioCounts(output);
        
        // Update global counts
        this.scenarioCounts.total += scenarioCounts.total;
        this.scenarioCounts.passed += scenarioCounts.passed;
        this.scenarioCounts.failed += scenarioCounts.failed;
        this.scenarioCounts.skipped += scenarioCounts.skipped;
        
        // Log results
        this.logger.info(`Tests for folder ${folder} completed with ${success ? 'success' : 'failure'}`);
        this.logger.info(`Scenarios: ${scenarioCounts.total} total, ${scenarioCounts.passed} passed, ${scenarioCounts.failed} failed, ${scenarioCounts.skipped} skipped`);
        
        // Check if the scenario count matches the expected count
        if (scenarioCounts.total !== expectedScenarios) {
          this.logger.warn(`Warning: Expected ${expectedScenarios} scenarios but found ${scenarioCounts.total} in the output`);
        }
        
        this.results[folder] = {
          success,
          code,
          output,
          scenarioCounts
        };
        
        resolve({ 
          folder, 
          success, 
          code,
          scenarioCounts
        });
      });
      
      // Add to processes list
      this.processes.push(proc);
    });
  }

  /**
   * Run tests in parallel by folder
   * @returns {Promise} Promise that resolves when all tests are complete
   */
  async runParallel() {
    const folders = this.getFeatureFolders();
    
    if (folders.length === 0) {
      this.logger.warn('No feature folders found');
      return { success: false, message: 'No feature folders found' };
    }
    
    // Reset scenario counts
    this.scenarioCounts = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    
    this.logger.info(`Running tests in parallel for ${folders.length} folders`);
    
    // Create an array of promises for each folder
    const promises = folders.map(folder => this.runFolderTests(folder));
    
    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    
    // Check if all tests passed
    const allPassed = results.every(result => result.success);
    
    // Log overall results
    this.logger.info(`All tests completed. Overall result: ${allPassed ? 'PASS' : 'FAIL'}`);
    this.logger.info(`Total scenarios: ${this.scenarioCounts.total} (${this.scenarioCounts.passed} passed, ${this.scenarioCounts.failed} failed, ${this.scenarioCounts.skipped} skipped)`);
    
    return {
      success: allPassed,
      folderResults: results,
      detailedResults: this.results,
      scenarioCounts: this.scenarioCounts
    };
  }

  /**
   * Run tests for specific folders
   * @param {Array} folders - List of folder names
   * @returns {Promise} Promise that resolves when all tests are complete
   */
  async runSpecificFolders(folders) {
    if (!Array.isArray(folders) || folders.length === 0) {
      this.logger.warn('No folders specified');
      return { success: false, message: 'No folders specified' };
    }
    
    // Reset scenario counts
    this.scenarioCounts = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    
    this.logger.info(`Running tests in parallel for specified folders: ${folders.join(', ')}`);
    
    // Create an array of promises for each folder
    const promises = folders.map(folder => this.runFolderTests(folder));
    
    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    
    // Check if all tests passed
    const allPassed = results.every(result => result.success);
    
    // Log overall results
    this.logger.info(`All tests completed. Overall result: ${allPassed ? 'PASS' : 'FAIL'}`);
    this.logger.info(`Total scenarios: ${this.scenarioCounts.total} (${this.scenarioCounts.passed} passed, ${this.scenarioCounts.failed} failed, ${this.scenarioCounts.skipped} skipped)`);
    
    return {
      success: allPassed,
      folderResults: results,
      detailedResults: this.results,
      scenarioCounts: this.scenarioCounts
    };
  }

  /**
   * Kill all running processes
   */
  killAll() {
    this.logger.info(`Killing ${this.processes.length} running processes`);
    
    this.processes.forEach(proc => {
      try {
        proc.kill();
      } catch (error) {
        this.logger.error(`Failed to kill process: ${error.message}`);
      }
    });
    
    this.processes = [];
  }
}

module.exports = new ParallelRunner(); 