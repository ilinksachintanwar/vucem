const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const FileUploadHelper = require('../utils/FileUploadHelper');
const AllureReportHelper = require('../utils/AllureReportHelper');
const Logger = require('../utils/Logger');

const logger = new Logger('Hooks');

// Track which scenarios have been run to prevent duplicates
const runScenarios = new Set();

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Before all tests
BeforeAll(async function() {
  // Any setup that needs to happen once before all tests
});

// After all tests
AfterAll(async function() {
  // Any cleanup that needs to happen after all tests
});

// Before each scenario
Before(async function(scenario) {
  this.testName = scenario.pickle.name;
  this.logger.info('Test setup complete');
  this.logger.info('Starting test execution');
  this.logger.info(`Starting scenario: ${this.testName}`);
  
  this.logger.info('Launching chromium browser (headless: false)');
  await this.setup();
  this.logger.info('Browser setup complete');
});

// After each scenario
After(async function(scenario) {
  this.logger.info(`Finishing scenario: ${this.testName}`);
  
  // Take screenshot if scenario failed
  if (scenario.result.status === Status.FAILED) {
    this.logger.info('Scenario failed, taking screenshot');
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-').replace('T', '_');
    const screenshotPath = path.join(
      screenshotsDir, 
      `${this.testName.replace(/\s+/g, '_')}_${timestamp}.png`
    );
    
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger.info(`Screenshot saved to: ${screenshotPath}`);
    } catch (error) {
      this.logger.error(`Failed to take screenshot: ${error.message}`);
    }
  }
  
  await this.teardown();
  this.logger.info('Browser closed');
  this.logger.info('Test execution complete');
});

// Before all scenarios
BeforeAll(async function() {
  logger.info('Starting test execution');
  
  // Clear the set of run scenarios
  runScenarios.clear();
});

// After all scenarios
AfterAll(async function() {
  logger.info('Test execution complete');
}); 