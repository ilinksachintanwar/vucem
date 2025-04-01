const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');
const GooglePage = require('../pages/GooglePage');
const path = require('path');
const logger = require('./logger');

// Store browser and context at the module level to share across scenarios
let browser = null;
let context = null;

class CustomWorld {
  constructor({ parameters }) {
    this.logger = logger;
    this.parameters = parameters;
    this.tempFiles = []; // Initialize tempFiles array
    this.currentFeature = null;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testName = '';
    this.selectors = require('../page_objects/selectors.json');
  }

  getSelector(pageName, elementName) {
    try {
      return this.selectors[pageName][elementName];
    } catch (error) {
      this.logger.error(`Selector not found for ${elementName} on ${pageName}`);
      throw new Error(`Selector not found for ${elementName} on ${pageName}`);
    }
  }

  async init(featureUri) {
    // Track the current feature file
    const newFeature = featureUri.split('/').pop();
    
    // If this is the first scenario or we're in a new feature file
    if (!browser || (this.currentFeature && this.currentFeature !== newFeature)) {
      // Close existing browser if we're switching features
      if (browser) {
        await this.closeBrowser();
      }
      
      // Get browser type from environment variable or default to chromium
      const browserType = this.getBrowserType();
      
      // Launch new browser
      browser = await browserType.launch({
        headless: process.env.HEADLESS === 'true',
        slowMo: process.env.HEADLESS === 'true' ? 0 : 50
      });
      
      this.currentFeature = newFeature;
    }
    
    // Always create a new context and page for each scenario
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    // Store context in this for access from hooks
    this.context = context;
    
    // Create a new page
    this.page = await context.newPage();
    
    // Initialize page objects
    this.googlePage = new GooglePage(this.page);
  }

  /**
   * Get the browser type based on environment variable
   * @returns {object} Playwright browser type
   */
  getBrowserType() {
    const browserName = (process.env.BROWSER || 'chromium').toLowerCase();
    
    switch (browserName) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  async closePage() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }

  async closeBrowser() {
    if (browser) {
      await browser.close();
      browser = null;
    }
  }

  async setup() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(CustomWorld); 