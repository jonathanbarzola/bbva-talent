/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss)$": "<rootDir>/__mocks__/styleMock.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.(ts|tsx)"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "components/**/*.tsx",
    "!**/*.d.ts",
  ],
};

module.exports = config;
