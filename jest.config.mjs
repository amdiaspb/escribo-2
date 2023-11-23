/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  coverageProvider: "v8",
  moduleDirectories: ["node_modules"],
  testMatch: ["<rootDir>/tests/**/*.(test|spec).js"],
};

export default config;
