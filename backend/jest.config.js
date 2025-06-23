const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/jest.global-setup.ts',
  globalTeardown: '<rootDir>/jest.global-teardown.ts',
  setupFiles: ['<rootDir>/jest.env.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  maxWorkers: 1,            // only one worker
  testTimeout: 20000,
};