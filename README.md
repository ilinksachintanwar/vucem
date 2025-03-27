# 🎭 Playwright BDD Testing Framework

A behavior-driven development (BDD) testing framework using Playwright and Cucumber.js.

## ✨ Features

- 🥒 BDD approach with Cucumber.js
- 🎭 Playwright for browser automation
- 📊 CSV-based locator management
- 📈 Allure reporting
- 💻 Cross-platform support
- 📝 Comprehensive logging

## 🔧 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🚀 Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/playwright-bdd-framework.git
   cd playwright-bdd-framework
   ```

2. Install dependencies:
   ```
   npm install
   ```
   This will also automatically install Playwright browsers.

## 📁 Project Structure

## Locator Management

Locators are stored in CSV format in the `locators/` directory. Each page has its own CSV file (e.g., `google.csv`) with the following structure:

```
locator_name,locator_type,locator_value
```

Example:
```
search_box,xpath,//textarea[@name='q']
```

Supported locator types:
- `css`: CSS selectors
- `xpath`: XPath expressions
- `text`: Text content
- `id`: Element ID (will be converted to #id)
- `class`: Element class (will be converted to .class)

## 📂 File Upload Support

The framework includes a `FileUploadHelper` utility for handling file uploads in tests: 

## 🔍 Troubleshooting

### Command not found errors

If you encounter a "command not found" error when running tests, make sure:

1. All dependencies are installed:
   ```
   npm install
   ```

2. Use npx to run locally installed binaries:
   ```
   npx cucumber-js
   ```

3. Check that your package.json scripts are correctly configured:
   ```json
   "scripts": {
     "test": "npx cucumber-js",
     "test:report": "npx cucumber-js --format @cucumber/pretty-formatter --format json:reports/cucumber-report.json"
   }
   ``` 

## 🏃‍♂️ Running Tests

Run all tests:
```
npm test
```

Run only Google search tests:
```
npm run test:google
```

Run tests with reporting:
```
npm run test:report
```

Run specific feature files:
```
npx cucumber-js features/specificFeature.feature
```

Run tests with specific tags:
```
npx cucumber-js --tags "@tagName"
```

## 🔄 Hooks and World Object

The framework uses Cucumber.js hooks for setup and teardown:

- **BeforeAll**: Creates necessary directories for artifacts
- **Before**: Initializes the browser and page objects before each scenario
- **After**: Takes screenshots on failure and cleans up resources
- **AfterAll**: Performs final cleanup

The World object provides a shared context for all step definitions:

```javascript
// Access the page object
await this.googlePage.navigate();

// Access the Playwright page
await this.page.screenshot();

// Store temporary data
this.tempFiles.push('filename.txt');
```

## 🏷️ Running Tests with Tags

You can use tags to organize and selectively run tests:

Run tests with a specific tag:
```
npm run test:tags "@smoke"
```

Run Google-related tests:
```
npm run test:google-tag
```

### Tag Expressions

Cucumber.js supports complex tag expressions:

- AND: `--tags "@smoke and @critical"`
- OR: `--tags "@smoke or @regression"`
- NOT: `--tags "not @wip"`

### Common Tag Categories

- `@smoke` - Critical path tests for smoke testing
- `@regression` - Tests for regression testing
- `@wip` - Work in progress (typically skipped in CI)
- `@critical` - Business-critical functionality
- `@flaky` - Tests that might be unstable (can be configured for retries)

## 🚀 Performance Optimizations

### Browser Reuse

The framework is optimized to reuse the browser session across scenarios in the same feature file:

- One browser instance is launched per feature file
- Each scenario gets a fresh context and page
- This significantly improves execution speed for features with multiple scenarios

This approach balances isolation (each test gets a fresh page) with performance (browser startup happens only once per feature).

### When the browser restarts:

- When switching to a new feature file
- If a fatal browser error occurs
- After all scenarios in a feature are complete

## 📸 Screenshot Capture

The framework automatically captures screenshots when tests fail:

- Screenshots are saved in the `screenshots/` directory
- Screenshots are named with the scenario name and timestamp for easy identification
- Screenshots are attached to the test report for easy access

To view screenshots:
1. Check the `screenshots/` directory for files with the `FAILED-` prefix
2. In the Allure report, screenshots are attached to the corresponding test case

### Cleanup

Old screenshots can be cleaned up using:
```
npm run cleanup
```

This will remove screenshots older than 7 days.

## 📊 Allure Reporting

The framework integrates with Allure to provide rich, interactive test reports.

### Generating Reports

1. Run tests with Allure reporting enabled:
   ```
   npm run test:report
   ```

2. Generate and open the Allure report:
   ```
   npm run report
   ```

### Report Features

The Allure report provides:

- Test execution summary with pass/fail statistics
- Detailed test case information including steps
- Screenshots of failed tests
- Environment information
- Test execution timeline
- Filtering and searching capabilities

### Command Line Options

Generate report without opening it:
```
npx allure generate ./allure-results --clean -o ./allure-report
```

Open an existing report:
```
npx allure open ./allure-report
```

Serve the report on a specific port:
```
npx allure serve ./allure-results -p 8080
```

### CI/CD Integration

For CI/CD pipelines, use:
```
npm run test:report && npx allure generate ./allure-results --clean -o ./allure-report
```

Then archive the `./allure-report` directory as an artifact.

## 🌐 Browser Selection

The framework supports running tests on different browsers:

### Using npm scripts:

```bash
# Run tests on Chrome (default)
npm test

# Run tests on Firefox
npm run test:firefox

# Run tests on WebKit (Safari)
npm run test:webkit

# Run tests on Firefox in headless mode
npm run test:firefox:headless
```

### Using environment variables:

```bash
# Run tests on Firefox
BROWSER=firefox npm test

# Run tests on WebKit
BROWSER=webkit npm test

# Run tests on Firefox in headless mode
BROWSER=firefox HEADLESS=true npm test
```

The framework supports the following browsers:
- `chromium` (default): Chrome/Chromium
- `firefox`: Mozilla Firefox
- `webkit`: Safari/WebKit

## 🚀 Parallel Execution

The framework supports running tests in parallel by folder:

### Folder Structure

Organize your feature files into folders for parallel execution:

```
features/
  ├── ECONOMIA/
  │   ├── feature1.feature
  │   ├── feature2.feature
  │   └── ...
  ├── HACIENDA/
  │   ├── feature3.feature
  │   ├── feature4.feature
  │   └── ...
  └── ESPANOL/
      ├── feature5.feature
      ├── feature6.feature
      └── ...
```

### Running Tests in Parallel

Run all folders in parallel:
```
npm run test:parallel
```

Run specific folders in parallel:
```
npm run test:parallel:all
```

Run a specific folder:
```
npm run test:parallel:economia
```

### Controlling Parallelism

Limit the number of parallel workers:
```
npm run test:parallel:workers
```

Or use the command line directly:
```
node src/scripts/run-parallel.js --folders ECONOMIA,HACIENDA --workers 2
```

### How Parallel Execution Works

1. Each folder runs in a separate process (parallel execution)
2. Feature files within a folder run sequentially
3. For each folder, a single browser instance is launched
4. Test results are aggregated and reported at the end
5. The process exits with code 0 if all tests pass, 1 otherwise

### Parallel Execution Reports

The parallel runner provides detailed reporting:

- Summary of all test execution
- Total duration of the test run
- Scenario counts (total, passed, failed, skipped)
- Per-folder results with scenario counts
- JSON reports for each folder in the reports directory