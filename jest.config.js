module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Adjust this to your source folder
  testMatch: ['**/test/**/*.test.ts', '**/?(*.)+(spec|test).ts'], // Test files pattern
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // Include all TypeScript files
    '!src/**/*.d.ts', // Exclude declaration files
    '!src/**/index.ts', // Exclude index files if necessary
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'], // Coverage formats
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Alias for imports (e.g., "@/module" -> "src/module")
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Path to your tsconfig
    },
  },
};
