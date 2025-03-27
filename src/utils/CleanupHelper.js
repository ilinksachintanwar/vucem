const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class CleanupHelper {
  constructor() {
    this.logger = new Logger('CleanupHelper');
  }

  /**
   * Clean up old screenshot files
   * @param {number} maxAgeInDays - Maximum age of files to keep (in days)
   */
  cleanupOldScreenshots(maxAgeInDays = 7) {
    this.logger.info(`Cleaning up screenshot files older than ${maxAgeInDays} days`);
    
    try {
      const screenshotsDir = path.resolve(__dirname, '../../screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        return;
      }
      
      const files = fs.readdirSync(screenshotsDir);
      const now = Date.now();
      const maxAgeMs = maxAgeInDays * 24 * 60 * 60 * 1000;
      
      let deletedCount = 0;
      
      files.forEach(file => {
        if (file.endsWith('.png')) {
          const filePath = path.join(screenshotsDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtime.getTime();
          
          if (fileAge > maxAgeMs) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      });
      
      this.logger.info(`Deleted ${deletedCount} old screenshot files`);
    } catch (error) {
      this.logger.error(`Failed to clean up old screenshots: ${error.message}`);
    }
  }
}

module.exports = new CleanupHelper(); 