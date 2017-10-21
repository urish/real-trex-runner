module.exports = function () {

  return {
    files: [
      'src/**/*.js',
      '!src/**/*.spec.js',
      'util/**/*.js',
      'util/**/fixtures/*.txt',
      '!util/**/*.spec.js',
    ],

    tests: [
      'src/**/*.spec.js',
      'util/**/*.spec.js',
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest'
  };
};
