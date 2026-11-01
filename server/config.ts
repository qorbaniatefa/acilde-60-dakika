import dotenv from 'dotenv';
import path from 'node:path';

export function loadEnvironment(directory = process.cwd(), target: NodeJS.ProcessEnv = process.env): void {
  dotenv.config({ path: [path.join(directory, '.env.local'), path.join(directory, '.env')], processEnv: target, quiet: true });
}
