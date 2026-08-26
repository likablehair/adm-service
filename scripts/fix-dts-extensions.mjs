import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DECLARATIONS_ROOT = resolve('dist', 'src');

const RELATIVE_IMPORT = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]*)\2/g;

function collect(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...collect(path));
    else if (path.endsWith('.d.ts')) found.push(path);
  }
  return found;
}

let rewritten = 0;

for (const file of collect(DECLARATIONS_ROOT)) {
  const source = readFileSync(file, 'utf8');

  const output = source.replace(
    RELATIVE_IMPORT,
    (match, keyword, quote, target) => {
      if (/\.(js|cjs|mjs|json)$/.test(target)) return match;
      return `${keyword}${quote}${target}.js${quote}`;
    },
  );

  if (output !== source) {
    writeFileSync(file, output, 'utf8');
    rewritten++;
  }
}

console.log(`fixed relative imports in ${rewritten} declaration file(s)`);
