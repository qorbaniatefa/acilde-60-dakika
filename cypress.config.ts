import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  videosFolder: 'artifacts/cypress/videos',
  screenshotsFolder: 'artifacts/cypress/screenshots',
  trashAssetsBeforeRuns: false,
  e2e: { baseUrl: 'http://127.0.0.1:3000', specPattern: 'cypress/e2e/**/*.cy.ts', supportFile: false },
  viewportWidth: 375,
  viewportHeight: 812,
});
