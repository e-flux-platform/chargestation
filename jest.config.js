process.env.ENV_NAME = 'test';

module.exports = {
  moduleDirectories: ['node_modules', './src/', './serve'],
  testPathIgnorePatterns: ['node_modules', '\\w+.ignore.js'],
};
