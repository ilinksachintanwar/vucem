const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class FileUploadHelper {
  constructor() {
    this.logger = new Logger('FileUploadHelper');
    this.projectRoot = path.resolve(__dirname, '../../');
    this.uploadDir = path.resolve(this.projectRoot, 'test-data/uploads');
  }

  /**
   * Upload a file to an input element
   * @param {Page} page - Playwright page object
   * @param {string} filePath - Path to the file (can be relative to project root or absolute)
   * @param {string} locatorName - Locator name in the CSV file
   * @param {string} pageName - Page name in the CSV file
   * @param {number} timeout - Timeout in milliseconds
   */
  async uploadFile(page, filePath, locatorName, pageName, timeout = 10000) {
    this.logger.info(`Uploading file '${filePath}' to '${locatorName}' on '${pageName}'`);
    
    try {
      // Resolve the file path (check multiple locations)
      const resolvedFilePath = this.resolveFilePath(filePath);
      
      // Get the locator for the file input element
      const ElementHelper = require('./ElementHelper');
      const locatorValue = await ElementHelper.getLocator(pageName, locatorName);
      
      // Set the file input value
      await page.setInputFiles(locatorValue, resolvedFilePath);
      
      this.logger.info(`Successfully uploaded file '${filePath}' to '${locatorName}'`);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      await page.screenshot({ path: `./screenshots/file-upload-error-${Date.now()}.png` });
      throw error;
    }
  }

  /**
   * Upload multiple files to an input element
   * @param {Page} page - Playwright page object
   * @param {Array<string>} filePaths - Array of paths to files
   * @param {string} locatorName - Locator name in the CSV file
   * @param {string} pageName - Page name in the CSV file
   * @param {number} timeout - Timeout in milliseconds
   */
  async uploadMultipleFiles(page, filePaths, locatorName, pageName, timeout = 10000) {
    this.logger.info(`Uploading multiple files to '${locatorName}' on '${pageName}'`);
    
    try {
      // Resolve all file paths
      const resolvedFilePaths = filePaths.map(filePath => this.resolveFilePath(filePath));
      
      // Get the locator for the file input element
      const ElementHelper = require('./ElementHelper');
      const locatorValue = await ElementHelper.getLocator(pageName, locatorName);
      
      // Set the file input value with multiple files
      await page.setInputFiles(locatorValue, resolvedFilePaths);
      
      this.logger.info(`Successfully uploaded ${filePaths.length} files to '${locatorName}'`);
    } catch (error) {
      this.logger.error(`Failed to upload multiple files: ${error.message}`);
      await page.screenshot({ path: `./screenshots/multi-file-upload-error-${Date.now()}.png` });
      throw error;
    }
  }

  /**
   * Resolve a file path by checking multiple locations
   * @param {string} filePath - Path to resolve
   * @returns {string} - Resolved absolute file path
   */
  resolveFilePath(filePath) {
    // Check if it's an absolute path
    if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
      return filePath;
    }
    
    // Check if it's relative to project root
    const projectRootPath = path.resolve(this.projectRoot, filePath);
    if (fs.existsSync(projectRootPath)) {
      return projectRootPath;
    }
    
    // Check if it's a certificate file
    if (filePath.endsWith('.cert') || filePath.endsWith('.crt') || filePath.endsWith('.pem')) {
      const certPath = path.resolve(this.projectRoot, 'test-data/uploads/certificates', filePath);
      if (fs.existsSync(certPath)) {
        return certPath;
      }
    }
    
    // Check if it's a key file
    if (filePath.endsWith('.key')) {
      const keyPath = path.resolve(this.projectRoot, 'test-data/uploads/keys', filePath);
      if (fs.existsSync(keyPath)) {
        return keyPath;
      }
    }
    
    // Check if it's in the test-data/uploads directory
    const uploadDirPath = path.resolve(this.uploadDir, filePath);
    if (fs.existsSync(uploadDirPath)) {
      return uploadDirPath;
    }
    
    // Check if it's in the test-data directory
    const testDataPath = path.resolve(this.projectRoot, 'test-data', filePath);
    if (fs.existsSync(testDataPath)) {
      return testDataPath;
    }
    
    // If we couldn't find the file, throw an error
    this.logger.error(`File not found: ${filePath}`);
    throw new Error(`File not found: ${filePath}. Checked locations: absolute path, project root, certificates, keys, test-data/uploads, and test-data directories.`);
  }

  /**
   * Create a temporary file for upload testing
   * @param {string} fileName - Name of the file to create
   * @param {string} content - Content to write to the file
   * @returns {string} - Path to the created file
   */
  async createTempFile(fileName, content = 'Test file content') {
    this.logger.info(`Creating temporary file: ${fileName}`);
    
    try {
      // Ensure the upload directory exists
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      
      const filePath = path.join(this.uploadDir, fileName);
      fs.writeFileSync(filePath, content);
      
      this.logger.info(`Successfully created temporary file: ${filePath}`);
      return fileName;
    } catch (error) {
      this.logger.error(`Failed to create temporary file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a temporary file
   * @param {string} fileName - Name of the file to delete
   */
  async deleteTempFile(fileName) {
    this.logger.info(`Deleting temporary file: ${fileName}`);
    
    try {
      const filePath = path.join(this.uploadDir, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.info(`Successfully deleted temporary file: ${filePath}`);
      } else {
        this.logger.warn(`File not found for deletion: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete temporary file: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FileUploadHelper(); 