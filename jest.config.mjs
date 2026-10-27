import nextJest from "next/jest.js";

// next/jest wires up the SWC transform, CSS/font/image mocks and .env loading.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  // jsdom plus the Fetch/Encoding globals Node already has (see the file).
  testEnvironment: "<rootDir>/jest.environment.mjs",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Playwright owns e2e/; Jest only runs unit and component tests.
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
};

export default createJestConfig(config);
