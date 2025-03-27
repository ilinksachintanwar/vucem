const { expect } = require('@playwright/test');
const Logger = require('./Logger');
const CSVReader = require('./CSVReader');

class ElementHelper {
  constructor() {
    this.logger = new Logger('ElementHelper');
  }

  /**
   * Wait for an element to be in the desired state
   * @param {Page} page - Playwright page object
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file
   * @param {string} state - Desired state: 'visible', 'enabled', 'selected', 'hidden'
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} - The located element
   */
  async waitForElement(page, pageName, locatorName, state = 'visible', timeout = 10000) {
    this.logger.info(`Waiting for element '${locatorName}' on '${pageName}' to be ${state}`);
    
    try {
      // Get the locator value from CSV
      const locatorValue = await CSVReader.getLocator(pageName, locatorName);
      const element = page.locator(locatorValue);
      
      // Wait for the element to be in the desired state
      switch (state.toLowerCase()) {
        case 'visible':
          await element.waitFor({ state: 'visible', timeout });
          break;
        case 'enabled':
          await element.waitFor({ state: 'visible', timeout });
          await expect(element).toBeEnabled({ timeout });
          break;
        case 'selected':
          await element.waitFor({ state: 'visible', timeout });
          await expect(element).toBeChecked({ timeout });
          break;
        case 'hidden':
          await element.waitFor({ state: 'hidden', timeout });
          break;
        default:
          this.logger.error(`Unsupported state: ${state}`);
          throw new Error(`Unsupported state: ${state}`);
      }
      
      this.logger.info(`Element '${locatorName}' is now ${state}`);
      return element;
    } catch (error) {
      this.logger.error(`Failed to wait for element '${locatorName}' to be ${state}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Click on an element after waiting for it to be visible and enabled
   * @param {Page} page - Playwright page object
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file
   * @param {number} timeout - Timeout in milliseconds
   */
  async clickElement(page, pageName, locatorName, timeout = 10000) {
    this.logger.info(`Clicking on element '${locatorName}' on '${pageName}'`);
    
    try {
      const element = await this.waitForElement(page, pageName, locatorName, 'enabled', timeout);
      await element.click();
      this.logger.info(`Successfully clicked on '${locatorName}'`);
    } catch (error) {
      this.logger.error(`Failed to click on '${locatorName}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Enter text into an element after waiting for it to be visible
   * @param {Page} page - Playwright page object
   * @param {string} text - Text to enter
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file
   * @param {number} timeout - Timeout in milliseconds
   */
  async enterText(page, text, pageName, locatorName, timeout = 10000) {
    this.logger.info(`Entering text '${text}' into '${locatorName}' on '${pageName}'`);
    
    try {
      const element = await this.waitForElement(page, pageName, locatorName, 'visible', timeout);
      await element.clear();
      await element.fill(text);
      this.logger.info(`Successfully entered text into '${locatorName}'`);
    } catch (error) {
      this.logger.error(`Failed to enter text into '${locatorName}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Get text from an element after waiting for it to be visible
   * @param {Page} page - Playwright page object
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<string>} - The text content of the element
   */
  async getText(page, pageName, locatorName, timeout = 10000) {
    this.logger.info(`Getting text from '${locatorName}' on '${pageName}'`);
    
    try {
      const element = await this.waitForElement(page, pageName, locatorName, 'visible', timeout);
      const text = await element.innerText();
      this.logger.info(`Text from '${locatorName}': ${text}`);
      return text;
    } catch (error) {
      this.logger.error(`Failed to get text from '${locatorName}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify element state
   * @param {Page} page - Playwright page object
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file
   * @param {string} state - Expected state: 'VISIBLE', 'ENABLED', 'SELECTED'
   * @param {number} timeout - Timeout in milliseconds
   */
  async verifyElementState(page, pageName, locatorName, state, timeout = 10000) {
    this.logger.info(`Verifying '${locatorName}' is ${state} on '${pageName}'`);
    
    try {
      const locatorValue = await CSVReader.getLocator(pageName, locatorName);
      const element = page.locator(locatorValue);
      
      switch (state.toUpperCase()) {
        case 'VISIBLE':
          await expect(element).toBeVisible({ timeout });
          this.logger.info(`Element '${locatorName}' is visible`);
          break;
        case 'ENABLED':
          await expect(element).toBeEnabled({ timeout });
          this.logger.info(`Element '${locatorName}' is enabled`);
          break;
        case 'SELECTED':
          await expect(element).toBeChecked({ timeout });
          this.logger.info(`Element '${locatorName}' is selected`);
          break;
        default:
          this.logger.error(`Unsupported state: ${state}`);
          throw new Error(`Unsupported state: ${state}`);
      }
    } catch (error) {
      this.logger.error(`Verification failed for '${locatorName}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform a keyboard action on an element
   * @param {Page} page - Playwright page object
   * @param {string} action - Keyboard action: 'Enter', 'Tab', 'Escape', etc.
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file (optional)
   * @param {number} timeout - Timeout in milliseconds
   */
  async performKeyboardAction(page, action, pageName, locatorName = null, timeout = 10000) {
    if (locatorName) {
      this.logger.info(`Performing keyboard action '${action}' on '${locatorName}' on '${pageName}'`);
      
      try {
        const element = await this.waitForElement(page, pageName, locatorName, 'visible', timeout);
        await element.press(action);
        this.logger.info(`Successfully performed keyboard action '${action}' on '${locatorName}'`);
      } catch (error) {
        this.logger.error(`Failed to perform keyboard action '${action}' on '${locatorName}': ${error.message}`);
        throw error;
      }
    } else {
      this.logger.info(`Performing keyboard action '${action}' on page '${pageName}'`);
      
      try {
        await page.keyboard.press(action);
        this.logger.info(`Successfully performed keyboard action '${action}' on page`);
      } catch (error) {
        this.logger.error(`Failed to perform keyboard action '${action}' on page: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Submit a form by pressing Enter on an element or clicking a submit button
   * @param {Page} page - Playwright page object
   * @param {string} pageName - Page name in the CSV file
   * @param {string} locatorName - Locator name in the CSV file
   * @param {number} timeout - Timeout in milliseconds
   */
  async submitForm(page, pageName, locatorName, timeout = 10000) {
    this.logger.info(`Submitting form using '${locatorName}' on '${pageName}'`);
    
    try {
      const element = await this.waitForElement(page, pageName, locatorName, 'visible', timeout);
      
      // Check if the element is a form element that can be submitted with Enter
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      
      if (['input', 'textarea', 'select'].includes(tagName)) {
        await element.press('Enter');
        this.logger.info(`Submitted form by pressing Enter on '${locatorName}'`);
      } else {
        // If it's not a form element, try clicking it (assuming it's a submit button)
        await element.click();
        this.logger.info(`Submitted form by clicking '${locatorName}'`);
      }
      
      // Wait for navigation or network idle after form submission
      await page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      this.logger.error(`Failed to submit form using '${locatorName}': ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ElementHelper(); 