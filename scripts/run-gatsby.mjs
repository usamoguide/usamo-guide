import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const gatsbyCli = createRequire(import.meta.url).resolve('gatsby/cli.js');
const pathEntries = [scriptsDirectory, process.env.PATH].filter(Boolean);

const result = spawnSync(process.execPath, [gatsbyCli, ...process.argv.slice(2)], {
  env: {
    ...process.env,
    PATH: pathEntries.join(path.delimiter),
  },
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
