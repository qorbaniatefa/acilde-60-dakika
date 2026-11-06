import { defineConfig } from 'cypress';
import fs from 'node:fs';

export default defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  videosFolder: 'artifacts/cypress/videos',
  screenshotsFolder: 'artifacts/cypress/screenshots',
  trashAssetsBeforeRuns: false,
  defaultCommandTimeout: 30000,
  e2e: { baseUrl: 'http://127.0.0.1:3000', specPattern: 'cypress/e2e/**/*.cy.ts', supportFile: false,
    setupNodeEvents(on) {
      on('task', {recordParity(result: {count: number; model_sha256: string; deltas: number[]}) {
        const filename = 'artifacts/primer-v2/browser-parity.json';
        fs.mkdirSync('artifacts/primer-v2', {recursive: true});
        const evidence = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
        evidence[String(result.count)] = result;
        fs.writeFileSync(filename, JSON.stringify(evidence, null, 2) + '\n');
        return null;
      }});
    },
  },
  viewportWidth: 375,
  viewportHeight: 812,
});
