const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { expect } = require('@playwright/test');
const GooglePage = require('../../pages/GooglePage');
const Logger = require('../../utils/Logger');

const logger = new Logger('GoogleSearchSteps');

// // Hooks
// Before(async function() {
//   logger.info('Starting browser');
//   this.browser = await chromium.launch({ headless: false });
//   this.context = await this.browser.newContext();
//   this.page = await this.context.newPage();
//   this.googlePage = new GooglePage(this.page);
// });

// After(async function() {
//   logger.info('Closing browser');
//   await this.context.close();
//   await this.browser.close();
// });

// // Google-specific steps
// Then('User verifies search results contain {string}', async function(expectedTerm) {
//   logger.info(`Verifying search results contain: ${expectedTerm}`);
//   const containsExpectedTerm = await this.googlePage.verifySearchResults(expectedTerm);
//   expect(containsExpectedTerm).toBeTruthy();
// }); 