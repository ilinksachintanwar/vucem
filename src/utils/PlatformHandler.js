const os = require('os');
const Logger = require('./Logger');

class PlatformHandler {
  constructor() {
    this.logger = new Logger('PlatformHandler');
    this.platform = os.platform();
    this.logger.info(`Current platform: ${this.platform}`);
  }

  isWindows() {
    return this.platform === 'win32';
  }

  isMac() {
    return this.platform === 'darwin';
  }

  isLinux() {
    return this.platform === 'linux';
  }

  getBrowserExecutablePath(browserName) {
    this.logger.info(`Getting executable path for browser: ${browserName}`);
    
    if (this.isWindows()) {
      switch (browserName.toLowerCase()) {
        case 'chrome':
          return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        case 'firefox':
          return 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
        case 'edge':
          return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
        default:
          this.logger.warn(`No default path for ${browserName} on Windows`);
          return null;
      }
    } else if (this.isMac()) {
      switch (browserName.toLowerCase()) {
        case 'chrome':
          return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        case 'firefox':
          return '/Applications/Firefox.app/Contents/MacOS/firefox';
        case 'safari':
          return '/Applications/Safari.app/Contents/MacOS/Safari';
        default:
          this.logger.warn(`No default path for ${browserName} on Mac`);
          return null;
      }
    } else if (this.isLinux()) {
      switch (browserName.toLowerCase()) {
        case 'chrome':
          return '/usr/bin/google-chrome';
        case 'firefox':
          return '/usr/bin/firefox';
        default:
          this.logger.warn(`No default path for ${browserName} on Linux`);
          return null;
      }
    }
    
    this.logger.error(`Unsupported platform: ${this.platform}`);
    return null;
  }

  getScreenshotPath() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotDir = this.isWindows() ? 
      'screenshots\\' : 
      'screenshots/';
    
    return `${screenshotDir}screenshot-${timestamp}.png`;
  }
}

module.exports = new PlatformHandler(); 