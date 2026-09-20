import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bump = process.argv[2];
const validBumps = ['patch', 'minor', 'major'];
if (!validBumps.includes(bump)) throw new Error(`Expected one of: ${validBumps.join(', ')}`);

const manifestPaths = ['package.json', 'plugin.json', '.codex-plugin/plugin.json', 'package-lock.json'];
const current = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
if (!match) throw new Error(`Unsupported current version: ${current}`);

let [, major, minor, patch] = match.map(Number);
if (bump === 'major') { major += 1; minor = 0; patch = 0; }
if (bump === 'minor') { minor += 1; patch = 0; }
if (bump === 'patch') patch += 1;
const next = `${major}.${minor}.${patch}`;

for (const relativePath of manifestPaths) {
  const filePath = path.join(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const updated = source.replace(/("version"\s*:\s*")\d+\.\d+\.\d+(")/, `$1${next}$2`);
  if (updated === source) throw new Error(`Could not update version in ${relativePath}`);
  fs.writeFileSync(filePath, updated);
}

console.log(next);
