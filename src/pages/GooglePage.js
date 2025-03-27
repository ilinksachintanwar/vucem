const { expect } = require('@playwright/test');
const Logger = require('../utils/Logger');
const CSVReader = require('../utils/CSVReader');
const ElementHelper = require('../utils/ElementHelper');

class GooglePage {
  constructor(page) {
    this.page = page;
    this.logger = new Logger('GooglePage');
    this.csvReader = CSVReader;
    this.pageName = 'google'; // This is the name of the CSV file (without extension)
    
    // Define page elements
    this.elements = {
      searchBox: 'input[name="q"]',
      searchButton: 'input[name="btnK"]',
      searchResults: 'div#search'
    };
  }

  async navigate() {
    this.logger.info('Navigating to Google');
    await this.page.goto('https://www.google.com');
    
    // Wait for the page to load
    await this.page.waitForLoadState('networkidle');
    
    // Accept cookies if the dialog appears
    try {
      const acceptButton = await this.page.$('button:has-text("Accept all")');
      if (acceptButton) {
        await acceptButton.click();
        this.logger.info('Accepted cookies');
      }
    } catch (error) {
      this.logger.info('No cookie dialog found or unable to accept');
    }
    
    this.logger.info('Successfully navigated to Google');
  }

  async search(searchTerm) {
    this.logger.info(`Searching for: ${searchTerm}`);
    
    // Enter search term
    await this.page.fill(this.elements.searchBox, searchTerm);
    
    // Click search button or press Enter
    try {
      // Try to click the search button
      await this.page.click(this.elements.searchButton);
    } catch (error) {
      // If that fails, press Enter
      this.logger.info('Search button not clickable, pressing Enter instead');
      await this.page.press(this.elements.searchBox, 'Enter');
    }
    
    // Wait for search results to load
    await this.page.waitForSelector(this.elements.searchResults);
    await this.page.waitForLoadState('networkidle');
    
    this.logger.info(`Search completed for: ${searchTerm}`);
  }

  async verifySearchResults(expectedText) {
    this.logger.info(`Verifying search results contain: ${expectedText}`);
    
    // Wait for search results to load
    await this.page.waitForSelector(this.elements.searchResults);
    
    // Get the text content of the search results
    const searchResultsText = await this.page.textContent(this.elements.searchResults);
    
    // Check if the expected text is in the search results
    const containsText = searchResultsText.includes(expectedText);
    
    if (containsText) {
      this.logger.info(`Search results contain "${expectedText}" as expected`);
    } else {
      this.logger.warn(`Search results do not contain "${expectedText}"`);
    }
    
    return containsText;
  }
}

module.exports = GooglePage; 