const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const source = fs
  .readFileSync(path.join(repo, 'gatsby-node.ts'), 'utf8')
  .replace(/\r\n/g, '\n');
const start = source.indexOf('function getGitAuthorTime');
const end = source.indexOf('// Questionable hack', start);
assert.ok(start >= 0 && end > start, 'getGitAuthorTime source was not found');

const getGitAuthorTime = new Function(
  'execSync',
  'execFileSync',
  'fs',
  'hasGitRepo',
  `${source
    .slice(start, end)
    .replace('filePath: string', 'filePath')}; return getGitAuthorTime;`
)(childProcess.execSync, childProcess.execFileSync, fs, () => true);

test('gets Git author time for an absolute path containing spaces', () => {
  const filePath = path.join(repo, 'gatsby-node.ts');
  const expected = childProcess
    .execFileSync('git', ['log', '-1', '--pretty=format:%aI', '--', filePath], {
      cwd: repo,
    })
    .toString();

  assert.equal(getGitAuthorTime(filePath), expected);
});
