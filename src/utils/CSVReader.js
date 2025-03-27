const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const Logger = require('./Logger');

class CSVReader {
  constructor() {
    this.logger = new Logger('CSVReader');
    this.locatorsCache = {};
  }

  /**
   * Get locators for a specific page from the corresponding CSV file
   * @param {string} pageName - Name of the page (used to find the CSV file)
   * @returns {Promise<Object>} - Object with locator names as keys and locator details as values
   */
  async getLocatorsFromCSV(pageName) {
    try {
      // Load locators for the page if not already cached
      if (!this.locatorsCache[pageName]) {
        await this.loadLocators(pageName);
      }

      return this.locatorsCache[pageName] || {};
    } catch (error) {
      this.logger.error(`Error retrieving locators for ${pageName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load locators from a page-specific CSV file
   * @param {string} pageName - Name of the page (used to find the CSV file)
   */
  async loadLocators(pageName) {
    try {
      const filePath = path.resolve(__dirname, `../../locators/${pageName}.csv`);
      this.logger.info(`Loading locators from: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        this.logger.error(`Locator file not found: ${filePath}`);
        throw new Error(`Locator file not found: ${filePath}`);
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse the CSV with robust options
      const records = parse(fileContent, { 
        columns: true, 
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true
      });
      
      // Create a map of locator names to their details
      const locators = {};
      records.forEach(record => {
        locators[record.locator_name] = {
          type: record.locator_type,
          value: record.locator_value
        };
      });
      
      this.locatorsCache[pageName] = locators;
      this.logger.info(`Successfully loaded ${Object.keys(locators).length} locators for ${pageName}`);
    } catch (error) {
      this.logger.error(`Failed to load locators for ${pageName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a specific locator for a page
   * @param {string} pageName - Name of the page
   * @param {string} locatorName - Name of the locator
   * @returns {Promise<string>} - Playwright-compatible locator string
   */
  async getLocator(pageName, locatorName) {
    const pageLocators = await this.getLocatorsFromCSV(pageName);
    
    if (!pageLocators[locatorName]) {
      this.logger.error(`Locator '${locatorName}' not found for page '${pageName}'`);
      throw new Error(`Locator '${locatorName}' not found for page '${pageName}'`);
    }
    
    const locator = pageLocators[locatorName];
    
    // Convert the locator type and value to a Playwright-compatible locator string
    switch (locator.type.toLowerCase()) {
      case 'css':
        return locator.value; // CSS selectors can be used directly
      case 'xpath':
        return `xpath=${locator.value}`; // XPath needs the xpath= prefix
      case 'text':
        return `text=${locator.value}`; // Text locator
      case 'id':
        return `#${locator.value}`; // ID selector
      case 'class':
        return `.${locator.value}`; // Class selector
      default:
        // Default to using the value as-is
        return locator.value;
    }
  }
}

module.exports = new CSVReader(); 