/** @type {import('jest').Config} */

const config = {
    testEnvironment: 'node',
    moduleFileExtensions: ['js'],
    testRegex: "/tests/.*\\.(test|spec)?\\.(js|jsx)$",
    silent: true
};

module.exports = config