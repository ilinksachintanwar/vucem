const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ElementHelper = require('../../utils/ElementHelper');
const Logger = require('../../utils/Logger');
const FileUploadHelper = require('../../utils/FileUploadHelper');
const GooglePage = require('../../pages/GooglePage');

const logger = new Logger('CommonSteps');

// Set a longer default timeout for all steps (30 seconds)
setDefaultTimeout(30000);

// Navigation steps
Given('User navigates to {string}', async function(pageName) {
  logger.info(`Navigating to: ${pageName}`);
  
  try {
    if (pageName === 'google') {
      // Initialize the Google page if it doesn't exist
      if (!this.googlePage) {
        this.googlePage = new GooglePage(this.page);
      }
      await this.googlePage.navigate();
    } else if (!pageName === 'google' && pageName !==null) {
      // Navigate directly to the upload page
      await this.page.goto(pageName);
    } else {
      logger.error(`Navigation to ${pageName} is not implemented`);
      throw new Error(`Navigation to ${pageName} is not implemented`);
    }
    
    logger.info(`Successfully navigated to ${pageName}`);
  } catch (error) {
    logger.error(`Failed to navigate to ${pageName}: ${error.message}`);
    throw error;
  }
});

// Click steps
When('User clicks {string} on {string}', async function(locatorName, pageName) {
  await ElementHelper.clickElement(this.page, pageName, locatorName);
});

// Input steps
When('User enters {string} in {string} on {string}', async function(text, locatorName, pageName) {
  await ElementHelper.enterText(this.page, text, pageName, locatorName);
});

// Verification steps
Then('User verifies {string} is {string} on {string}', async function(locatorName, state, pageName) {
  await ElementHelper.verifyElementState(this.page, pageName, locatorName, state);
});

// Get text steps
When('User gets text of {string} on {string}', async function(locatorName, pageName) {
  const text = await ElementHelper.getText(this.page, pageName, locatorName);
  this.textContent = text; // Store for later use
  return text;
});

// Select options

When('User selects {string} in {string} on {string}', async function(text, locatorName, pageName) { 
  await ElementHelper.selectOption(this.page, text, pageName, locatorName); 
});

// Wait steps
When('User waits for {int} seconds', async function(seconds) {
  logger.info(`Waiting for ${seconds} seconds`);
  await this.page.waitForTimeout(seconds * 1000);
});

// Form submission steps
When('User submits form using {string} on {string}', async function(locatorName, pageName) {
  await ElementHelper.submitForm(this.page, pageName, locatorName);
});

// Combined step for search actions
When('User searches for {string} in {string} on {string}', async function(text, locatorName, pageName) {
  // Enter text in the search field
  await ElementHelper.enterText(this.page, text, pageName, locatorName);
  
  // Submit the search by pressing Enter
  await ElementHelper.performKeyboardAction(this.page, 'Enter', pageName, locatorName);
  
  // Wait for search results to load
  await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  logger.info(`Completed search for '${text}'`);
});

// File upload steps
When('User add file {string} in {string} on {string}', async function(filePath, locatorName, pageName) {
  await FileUploadHelper.uploadFile(this.page, filePath, locatorName, pageName);
});

When('User add files {string} in {string} on {string}', async function(filePathsString, locatorName, pageName) {
  // Split the comma-separated file paths
  const filePaths = filePathsString.split(',').map(path => path.trim());
  await FileUploadHelper.uploadMultipleFiles(this.page, filePaths, locatorName, pageName);
});

// Verify search results
Then('User verifies search results contain {string}', async function(expectedText) {
  logger.info(`Verifying search results contain "${expectedText}"`);
  
  try {
    // Wait for search results to load
    await this.page.waitForSelector('div#search', { timeout: 10000 });
    
    // Get the text content of the search results
    const searchResultsText = await this.page.textContent('div#search');
    
    // Check if the expected text is in the search results
    expect(searchResultsText).toContain(expectedText);
    
    logger.info(`Search results contain "${expectedText}" as expected`);
  } catch (error) {
    logger.error(`Failed to verify search results: ${error.message}`);
    throw error;
  }
});

// Upload steps
When('User uploads {string} file', async function(fileName) {
  logger.info(`Uploading file: ${fileName}`);
  
  try {
    // Get the file path
    const filePath = require('path').resolve(__dirname, `../../../test-data/uploads/${fileName}`);
    
    // Set the file input
    await this.page.setInputFiles('input#file-upload', filePath);
    
    // Click the upload button
    await this.page.click('input#file-submit');
    
    logger.info(`File uploaded: ${fileName}`);
  } catch (error) {
    logger.error(`Failed to upload file: ${error.message}`);
    throw error;
  }
});

// Verify success message
Then('User should see success message', async function() {
  logger.info('Verifying success message');
  
  try {
    // Wait for the success message
    await this.page.waitForSelector('div.example h3', { timeout: 10000 });
    
    // Get the text content
    const message = await this.page.textContent('div.example h3');
    
    // Verify the message
    expect(message).toBe('File Uploaded!');
    
    logger.info('Success message verified');
  } catch (error) {
    logger.error(`Failed to verify success message: ${error.message}`);
    throw error;
  }
});

// Verify error message
Then('User should see error message', async function() {
  logger.info('Verifying error message');
  
  try {
    // Wait for the error message
    await this.page.waitForSelector('div.example h1', { timeout: 10000 });
    
    // Get the text content
    const message = await this.page.textContent('div.example h1');
    
    // Verify the message contains error
    expect(message).toContain('Internal Server Error');
    
    logger.info('Error message verified');
  } catch (error) {
    logger.error(`Failed to verify error message: ${error.message}`);
    throw error;
  }
});

// Temporary file creation and cleanup
Given('User creates a temporary file {string} with content {string}', async function(fileName, content) {
  await FileUploadHelper.createTempFile(fileName, content);
});

After(async function(scenario) {
  // Clean up any temporary files created during the test
  // This assumes you're storing created file names in the World context
  if (this.tempFiles && this.tempFiles.length > 0) {
    for (const fileName of this.tempFiles) {
      await FileUploadHelper.deleteTempFile(fileName);
    }
    this.tempFiles = [];
  }
});

/**
 * Add a certificate or key file to an input element
 */
When('User add {string} in {string} on {string}', async function(fileName, locatorName, pageName) {
  logger.info(`Adding file ${fileName} to ${locatorName} on ${pageName}`);
  
  try {
    // Use the FileUploadHelper to upload the file
    await FileUploadHelper.uploadFile(this.page, fileName, locatorName, pageName);
    
    logger.info(`Successfully added file ${fileName}`);
  } catch (error) {
    logger.error(`Failed to add file: ${error.message}`);
    throw error;
  }
}); 