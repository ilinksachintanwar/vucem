const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const FileUploadHelper = require('../utils/FileUploadHelper');
const AllureReportHelper = require('../utils/AllureReportHelper');
const Logger = require('../utils/Logger');

const logger = new Logger('Hooks');

// Track which scenarios have been run to prevent duplicates
const runScenarios = new Set();

// Create directories for artifacts if they don't exist
BeforeAll(async function() {
  const dirs = [
    'screenshots', 
    'reports', 
    'test-data/uploads', 
    'test-data/uploads/certificates',
    'test-data/uploads/keys',
    'allure-results'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.resolve(__dirname, '../../', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  
  // Add environment info to Allure report
  AllureReportHelper.addEnvironmentInfo();
  
  // Create test files for upload tests
  const uploadsDir = path.resolve(__dirname, '../../test-data/uploads');
  
  // Create a sample text file
  fs.writeFileSync(path.join(uploadsDir, 'sample.txt'), 'This is a sample text file for testing uploads.');
  
  // Create an invalid file (empty .exe)
  fs.writeFileSync(path.join(uploadsDir, 'invalid.exe'), '');
  
  // Create sample certificate and key files
  const certsDir = path.resolve(__dirname, '../../test-data/uploads/certificates');
  const keysDir = path.resolve(__dirname, '../../test-data/uploads/keys');
  
  // Create a sample certificate
  fs.writeFileSync(path.join(certsDir, 'sample.cert'), '-----BEGIN CERTIFICATE-----\nSAMPLE CERTIFICATE CONTENT\n-----END CERTIFICATE-----');
  
  // Create a sample key
  fs.writeFileSync(path.join(keysDir, 'sample.key'), '-----BEGIN PRIVATE KEY-----\nSAMPLE KEY CONTENT\n-----END PRIVATE KEY-----');
  
  logger.info('Test setup complete');
});

// Before each scenario
Before(async function(scenario) {
  // Check if this is a parallel run and if the scenario has already been run
  const isParallelRun = process.env.CUCUMBER_PARALLEL === '1';
  const scenarioId = `${scenario.pickle.uri}:${scenario.pickle.astNodeIds[0]}`;
  
  if (isParallelRun && runScenarios.has(scenarioId)) {
    logger.info(`Skipping already run scenario: ${scenario.pickle.name}`);
    return 'skipped';
  }
  
  // Mark this scenario as run
  runScenarios.add(scenarioId);
  
  // Continue with normal setup
  logger.info(`Starting scenario: ${scenario.pickle.name}`);
  
  // Determine browser type from environment variable or default to chromium
  const browserType = process.env.BROWSER || 'chromium';
  const headless = process.env.HEADLESS === 'true';
  
  logger.info(`Launching ${browserType} browser (headless: ${headless})`);
  
  try {
    // Launch browser based on type
    switch (browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch({ headless });
        break;
      case 'webkit':
        this.browser = await webkit.launch({ headless });
        break;
      default:
        this.browser = await chromium.launch({ headless });
    }
    
    // Create a new browser context
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      acceptDownloads: true
    });
    
    // Create a new page
    this.page = await this.context.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(30000);
    
    logger.info('Browser setup complete');
  } catch (error) {
    logger.error(`Failed to set up browser: ${error.message}`);
    throw error;
  }
});

// After each scenario
After(async function(scenario) {
  logger.info(`Finishing scenario: ${scenario.pickle.name}`);
  
  // Take screenshot if scenario failed
  if (scenario.result.status === 'FAILED') {
    logger.info('Scenario failed, taking screenshot');
    
    try {
      // Create screenshots directory if it doesn't exist
      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
      }
      
      // Generate screenshot filename
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      const screenshotPath = path.join(screenshotsDir, `${scenario.pickle.name.replace(/\s+/g, '_')}_${timestamp}.png`);
      
      // Take screenshot
      if (this.page) {
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info(`Screenshot saved to: ${screenshotPath}`);
      } else {
        logger.warn('Cannot take screenshot: page object is not available');
      }
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
    }
  }
  
  // Close browser
  try {
    if (this.browser) {
      await this.browser.close();
      logger.info('Browser closed');
    }
  } catch (error) {
    logger.error(`Failed to close browser: ${error.message}`);
  }
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