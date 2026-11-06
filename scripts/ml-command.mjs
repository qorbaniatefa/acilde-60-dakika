import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const localPython = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const result = spawnSync(existsSync(localPython) ? localPython : 'python', process.argv.slice(2), {
  cwd: root, stdio: 'inherit', env: {...process.env, PYTHONIOENCODING: 'utf-8'},
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
