// Offline sanity check for the profile package:
//  - every relative src/href/srcset in README.md resolves to a file
//  - every SVG is self-contained (no external http(s) references)
//  - SVGs stay under GitHub's comfortable size for README images
//
//   node scripts/check.mjs

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT } from './lib/svg.mjs';

let problems = 0;
const bad = (msg) => {
  problems++;
  console.error('  ✗ ' + msg);
};

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
const refs = [
  ...readme.matchAll(/(?:src|href|srcset)="([^"]+)"/g),
  ...readme.matchAll(/\]\(([^)]+)\)/g),
].map((m) => m[1]);
const local = refs.filter((r) => !/^(https?:|mailto:|#)/.test(r));
for (const r of new Set(local)) if (!existsSync(join(ROOT, r))) bad(`README reference not found: ${r}`);
const external = [...new Set(refs.filter((r) => /^https?:/.test(r)))];
console.log(`README: ${local.length} local references, ${external.length} external links`);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const svgs = walk(join(ROOT, 'assets')).filter((f) => f.endsWith('.svg') && !f.includes('vendor'));
for (const f of svgs) {
  const s = readFileSync(f, 'utf8');
  const rel = relative(ROOT, f);
  const ext = [...s.matchAll(/(?:href|src)="(https?:[^"]+)"/g)].map((m) => m[1]);
  if (ext.length) bad(`${rel} references external resources: ${ext.join(', ')}`);
  if (!s.startsWith('<svg') || !s.trimEnd().endsWith('</svg>')) bad(`${rel} is not a complete SVG document`);
  if (s.length > 1024 * 1024) bad(`${rel} is larger than 1 MB`);
}
console.log(`SVG: ${svgs.length} generated files checked`);

if (problems) {
  console.error(`${problems} problem(s) found`);
  process.exit(1);
}
console.log('OK');
console.log('External links (check online):\n  ' + external.join('\n  '));
