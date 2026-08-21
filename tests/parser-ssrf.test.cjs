const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const repo = path.resolve(__dirname, '..');
const calls = [];
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'axios') {
    return {
      get: async url => {
        calls.push(url);
        return { status: 200, data: '<html></html>', headers: {} };
      },
    };
  }
  return originalLoad.apply(this, arguments);
};
require(
  path.join(repo, 'node_modules', 'esbuild-register', 'dist', 'node')
).register({
  tsconfigRaw: { compilerOptions: { module: 'commonjs' } },
});
const parse = require(path.join(repo, 'src/api/(parsers)/parse.ts')).default;

test('rejects a URL whose hostname is not an allowed parser host', async () => {
  await assert.rejects(parse('https://attacker.example/'));
  assert.deepEqual(calls, []);
});
