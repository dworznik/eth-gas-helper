module.exports = {
  "automock": false,
  "setupFiles": [
    "./setupJest.js"
  ],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    '__tests__/(.*)': '<rootDir>/__tests__/$1',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
};
