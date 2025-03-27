const allure = require('allure-cucumberjs');
const os = require('os');
const { execSync } = require('child_process');

class AllureReportHelper {
  /**
   * Add environment information to Allure report
   */
  static addEnvironmentInfo() {
    try {
      // Get browser version
      const browserVersion = execSync('npx playwright --version').toString().trim();
      
      // Add environment info
      allure.addEnvironment('Browser', browserVersion);
      allure.addEnvironment('Platform', `${os.type()} ${os.release()}`);
      allure.addEnvironment('OS', `${os.platform()} ${os.arch()}`);
      allure.addEnvironment('Node.js', process.version);
      allure.addEnvironment('Hostname', os.hostname());
      
      // Add custom labels
      allure.addLabel('framework', 'Playwright BDD');
      allure.addLabel('language', 'JavaScript');
    } catch (error) {
      console.warn(`Failed to add environment info to Allure report: ${error.message}`);
    }
  }

  /**
   * Add a screenshot to the Allure report
   * @param {Buffer} screenshot - Screenshot buffer
   * @param {string} name - Screenshot name
   */
  static addScreenshot(screenshot, name = 'Screenshot') {
    try {
      allure.attachment(name, screenshot, 'image/png');
    } catch (error) {
      console.warn(`Failed to add screenshot to Allure report: ${error.message}`);
    }
  }

  /**
   * Add a custom attachment to the Allure report
   * @param {string} name - Attachment name
   * @param {string|Buffer} content - Attachment content
   * @param {string} type - MIME type
   */
  static addAttachment(name, content, type) {
    try {
      allure.attachment(name, content, type);
    } catch (error) {
      console.warn(`Failed to add attachment to Allure report: ${error.message}`);
    }
  }
}

module.exports = AllureReportHelper; 