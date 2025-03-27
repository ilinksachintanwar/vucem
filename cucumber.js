module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'src/step_definitions/**/*.js',
      'src/support/**/*.js'
    ],
    format: ['@cucumber/pretty-formatter'],
    parallel: 1,
    retry: 1,
    retryTagFilter: '@flaky',
    publishQuiet: true
  }
}; 