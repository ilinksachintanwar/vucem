/**
 * Configuration for the test framework
 */
const path = require('path');

// Project root directory
const rootDir = path.resolve(__dirname, '../../');

const config = {
  // Base URLs for different environments
  baseUrls: {
    dev: 'https://dev.example.com',
    qa: 'https://qa.example.com',
    staging: 'https://staging.example.com',
    prod: 'https://www.example.com'
  },
  
  // Default timeout values (in milliseconds)
  timeouts: {
    default: 30000,
    pageLoad: 60000,
    elementWait: 10000
  },
  
  // Browser configuration
  browser: {
    defaultBrowser: 'chromium', // chromium, firefox, or webkit
    headless: true,
    slowMo: 0,
    viewport: {
      width: 1280,
      height: 720
    }
  },
  
  // File paths
  paths: {
    root: rootDir,
    features: path.join(rootDir, 'features'),
    reports: path.join(rootDir, 'reports'),
    screenshots: path.join(rootDir, 'screenshots'),
    testData: path.join(rootDir, 'test-data'),
    uploads: path.join(rootDir, 'test-data/uploads'),
    sampleFiles: path.join(rootDir, 'test-data/sample-files'),
    locators: path.join(rootDir, 'locators')
  },
  
  // Reporting configuration
  reporting: {
    generateHtml: true,
    generateJson: true,
    screenshotOnFailure: true
  }
};

module.exports = config; 