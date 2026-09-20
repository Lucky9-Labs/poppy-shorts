import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifests = ['package.json', 'plugin.json', '.codex-plugin/plugin.json'];
const versions = manifests.map((relativePath) => {
  const filePath = path.join(root, relativePath);
  const document = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return { relativePath, version: document.version };
});

const uniqueVersions = new Set(versions.map(({ version }) => version));
if (uniqueVersions.size !== 1 || [...uniqueVersions][0] === undefined) {
  console.error('Version mismatch:');
  for (const entry of versions) console.error(`  ${entry.relativePath}: ${entry.version ?? '<missing>'}`);
  process.exit(1);
}

console.log(`All version-bearing manifests agree on ${versions[0].version}.`);
