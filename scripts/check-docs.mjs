#!/usr/bin/env node
// Checks the counts asserted in README, DESIGN-SYSTEM and LLM-GUIDE against the
// numbers computed from tokens/tokens.json. Pure Node, zero dependencies.
// Run with `npm run check:docs`.
//
// Why this exists
// ---------------
// Docs drift the moment a collection grows. Every number below was wrong at least
// once: Brand was documented as 25 tokens while Figma carried 28, and the README
// claimed 501 variables in 6 collections against an actual 505 in 7.
//
// Two rules make the check trustworthy:
//
//   1. A missing anchor is a failure, not a pass. If a sentence is reworded so its
//      pattern no longer matches, this script fails instead of silently checking
//      nothing. Rewording a checked sentence means updating its pattern here.
//   2. Only numbers derivable from tokens.json are checked. Counts that live in
//      Figma alone — atoms, variants, icons, text styles, Theme Lab cards — are
//      verified by reading the file, not by this script.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8');
const tokens = JSON.parse(read('tokens/tokens.json'));

// ── Numbers computed from the graph ───────────────────────────────────────
const PARTS = ['primitives', 'brand', 'theme', 'space', 'shape', 'typography', 'motion'];
const count = (part) => Object.keys(tokens[part].tokens).length;

// Figma collection name -> the slice it occupies here, for the §2.1 table.
const COLLECTION_OF = {
  '1. Primitives': 'primitives',
  '2. Brand': 'brand',
  '3. Theme': 'theme',
  '4. Space & Size': 'space',
  '5. Shape': 'shape',
  '6. Typography': 'typography',
  '7. Motion': 'motion',
};

const n = {
  variables: PARTS.reduce((a, p) => a + count(p), 0),
  collections: PARTS.length,
  effectStyles: count('effects'),
  brandTokens: count('brand'),
  accentSteps: Object.keys(tokens.brand.tokens).filter((k) => /^accent\/\d+$/.test(k)).length,
  neutralSteps: Object.keys(tokens.brand.tokens).filter((k) => /^neutral\/\d+$/.test(k)).length,
  typeRoles: Object.keys(tokens.typography.tokens).filter((k) => k.endsWith('/size')).length,
};
n.compiled = n.variables + n.effectStyles;
// A niche is one new mode filled across every Brand token.
n.nicheAliases = n.brandTokens;
// Brand x Shape x Typography x Density, then the same again in each Theme mode.
n.dialCombos = tokens.brand.modes.length * tokens.shape.modes.length *
  tokens.typography.modes.length * tokens.space.modes.length;

const WORD = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
const asNumber = (s) => (WORD[s.toLowerCase()] !== undefined ? WORD[s.toLowerCase()] : Number(s));

// ── The claims, and what each one must say ────────────────────────────────
// Each check names a file, a pattern, and the expected value of every capture
// group. `\s+` stands in for spaces so a claim may wrap across lines.
const checks = [
  ['README.md', /\*\*(\d+) variables\*\*\s+across\s+(\d+) collections/,
    [n.variables, n.collections]],
  ['README.md', /compiler reports (\d+) tokens:\s+(\d+)\s+\+\s+(\d+)/,
    [n.compiled, n.variables, n.effectStyles]],
  ['README.md', /fill (\d+) aliases/, [n.nicheAliases]],
  ['README.md', /\*\*(\d+)\s+×\s+(\d+)\s+×\s+(\d+)\s+×\s+(\d+)\s+=\s+(\d+)/,
    [tokens.brand.modes.length, tokens.shape.modes.length, tokens.typography.modes.length,
      tokens.space.modes.length, n.dialCombos]],

  ['docs/DESIGN-SYSTEM.md', /\*\*(\d+) variables across (\w+) collections\.\*\*/,
    [n.variables, n.collections]],
  ['docs/DESIGN-SYSTEM.md', /compiler reports (\d+) because it emits both:\s+(\d+)\s+\+\s+(\d+)/,
    [n.compiled, n.variables, n.effectStyles]],
  ['docs/DESIGN-SYSTEM.md', /Brand carries colour identity and nothing else\.\s+(\d+) tokens/,
    [n.brandTokens]],
  ['docs/DESIGN-SYSTEM.md', /an (\d+)-step `accent\/\*`/, [n.accentSteps]],
  ['docs/DESIGN-SYSTEM.md', /a (\d+)-step\s+`neutral\/\*`/, [n.neutralSteps]],
  ['docs/DESIGN-SYSTEM.md', /A niche is (\d+) aliases/, [n.nicheAliases]],
  ['docs/DESIGN-SYSTEM.md', /is (\d+) aliases in one collection/, [n.nicheAliases]],
  ['docs/DESIGN-SYSTEM.md', /\*\*The (\d+) type roles\*\*/, [n.typeRoles]],
  ['docs/DESIGN-SYSTEM.md', /(\d+)\s+×\s+(\d+)\s+×\s+(\d+)\s+×\s+(\d+)\s+=\s+\*\*(\d+)/,
    [tokens.brand.modes.length, tokens.shape.modes.length, tokens.typography.modes.length,
      tokens.space.modes.length, n.dialCombos]],

  ['docs/LLM-GUIDE.md', /A niche is (\d+) aliases/, [n.nicheAliases]],
  ['docs/LLM-GUIDE.md', /Fill (\d+) aliases/, [n.nicheAliases]],
];

const problems = [];

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

for (const [file, pattern, expected] of checks) {
  const text = read(file);
  const all = [...text.matchAll(new RegExp(pattern, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))];
  if (all.length === 0) {
    problems.push(`${file} — no sentence matches ${pattern}. It was reworded, moved or deleted; update the pattern in scripts/check-docs.mjs.`);
    continue;
  }
  for (const m of all) {
    expected.forEach((want, i) => {
      const got = asNumber(m[i + 1]);
      if (got !== want) {
        problems.push(`${file}:${lineOf(text, m.index)} — "${m[0].replace(/\s+/g, ' ')}" says ${m[i + 1]}, tokens.json says ${want}`);
      }
    });
  }
}

// ── The collection table in DESIGN-SYSTEM §2.1 ────────────────────────────
// | # | `1. Primitives` | Value | 260 | ... — variable count and mode count per row.
{
  const file = 'docs/DESIGN-SYSTEM.md';
  const text = read(file);
  const rows = [...text.matchAll(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|([^|]+)\|\s*(\d+)\s*\|/gm)];
  const seen = new Set();
  for (const r of rows) {
    const [, name, modes, vars] = r;
    const part = COLLECTION_OF[name];
    if (!part) {
      problems.push(`${file}:${lineOf(text, r.index)} — unknown collection "${name}"`);
      continue;
    }
    seen.add(name);
    if (Number(vars) !== count(part)) {
      problems.push(`${file}:${lineOf(text, r.index)} — ${name} lists ${vars} variables, tokens.json has ${count(part)}`);
    }
    const listed = modes.split(',').map((s) => s.trim()).filter(Boolean).length;
    if (listed !== tokens[part].modes.length) {
      problems.push(`${file}:${lineOf(text, r.index)} — ${name} lists ${listed} modes, tokens.json has ${tokens[part].modes.length}`);
    }
  }
  for (const name of Object.keys(COLLECTION_OF)) {
    if (!seen.has(name)) problems.push(`${file} — the §2.1 collection table has no row for ${name}`);
  }
}

if (problems.length) {
  console.error(`Docs disagree with tokens/tokens.json — ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `Docs agree with tokens/tokens.json — ${checks.length + 1} checks ` +
  `(${n.variables} variables in ${n.collections} collections, ${n.effectStyles} effect styles, ` +
  `${n.brandTokens} Brand tokens, ${n.typeRoles} type roles).`
);
