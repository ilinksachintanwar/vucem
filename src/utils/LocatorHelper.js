/**
 * Helper for managing page element locators
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Logger = require('./Logger');

const logger = new Logger('LocatorHelper');

class LocatorHelper {
  /**
   * Get all locators from CSV files
   * @returns {Object} Locators object
   */
  static getLocators() {
    const locatorsDir = path.resolve(__dirname, '../../locators');
    const locators = {};
    
    // Check if locators directory exists
    if (!fs.existsSync(locatorsDir)) {
      logger.warn('Locators directory not found, using default locators');
      return this.getDefaultLocators();
    }
    
    // Get all CSV files in the locators directory
    const files = fs.readdirSync(locatorsDir).filter(file => file.endsWith('.csv'));
    
    if (files.length === 0) {
      logger.warn('No CSV files found in locators directory, using default locators');
      return this.getDefaultLocators();
    }
    
    // Parse each CSV file
    files.forEach(file => {
      const pageName = path.basename(file, '.csv');
      locators[pageName] = {};
      
      const rows = [];
      fs.createReadStream(path.join(locatorsDir, file))
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          rows.forEach(row => {
            locators[pageName][row.name] = row.locator;
          });
        });
    });
    
    return locators;
  }
  
  /**
   * Get default locators
   * @returns {Object} Default locators
   */
  static getDefaultLocators() {
    return {
      'google': {
        'search_box': 'input[name="q"]',
        'search_button': 'input[name="btnK"]',
        'search_box_1': 'input[name="q"]'
      },
      'upload_page': {
        'file_input': 'input#file-upload',
        'upload_button': 'input#file-submit',
        'upload_success_message': 'div.example h3',
        'multiple_file_input': 'input#file-upload'
      }
    };
  }
}

module.exports = LocatorHelper; 