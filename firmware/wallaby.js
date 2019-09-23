module.exports = function () {

  return {
    files: [
      'src/**/*.js',
      '!src/**/*.spec.js',
      'assets/**/*.txt',
      'fixtures/*.txt'
    ],

    tests: [
      'src/**/*.spec.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest'
  };
};
