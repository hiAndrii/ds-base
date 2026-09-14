#!/usr/bin/env node
// Assembles the seven slices in tokens/.raw/ into tokens/tokens.json.
// Pure Node, zero dependencies. Run with `npm run export`.
//
// Why this exists
// ---------------
// The token graph lives in Figma. scripts/export-tokens.figma.js reads one
// slice at a time through the MCP `use_figma` tool (its result is capped at
// ~20 KB, well under the assembled 47 KB). This script stitches those slices
// back into a single file and refuses to write one that does not resolve.
//
// The metadata blocks below are the contract, not exported data — they are the
// part of tokens.json a human maintains.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RAW = resolve(ROOT, 'tokens/.raw');
const OUTPUT = resolve(ROOT, 'tokens/tokens.json');

// Emission order of the final file. Also the order slices are required in.
const PARTS = ['primitives', 'brand', 'theme', 'space', 'shape', 'typography', 'effects'];

const META = {
  $schema: 'design-system-base/v1',
  $description:
    'Token graph for Design System Base. Layers resolve Primitives -> Brand/Shape/Typography -> Theme -> component. Values in {braces} are aliases to another token by name. Components must only ever reference the semantic layers - never Primitives.',
  $dials: {
    Brand: 'colour identity: accent ramp, neutral ramp, accent contrast',
    Theme: 'light and dark resolution of every semantic colour',
    'Space & Size': 'density: padding, gaps, control heights',
    Shape: 'corner radius personality',
    Typography: 'typeface, leading, tracking, weight',
  },
  $rules: [
    'Every spacing, sizing and radius value is a multiple of 4.',
    'Stroke widths, font sizes and space/optical are the documented exemptions from the 4pt grid.',
    'space/optical (2px) compensates for the whitespace inside an icon box; it is the only Space token that is not an alias to the dimension scale.',
    'Primitives have empty Figma scopes and must never be bound to a node.',
    'The five dials are independent; any combination is valid.',
    'accent/solid is the ramp step where white text clears 4.5:1; bright hues (orange, cyan, emerald, teal) sit one step deeper than blues and violets. It doubles as the accent step that is legible AS text on a light surface.',
    'Font sizes are identical across all Typography modes so switching typeface restyles without reflowing.',
    'Effect styles carry geometry here and colour by alias, so a shadow keeps its shape while its colour follows the theme.',
  ],
};

function readSlice(part) {
  const path = resolve(RAW, `${part}.json`);
  if (!existsSync(path)) {
    throw new Error(
      `Missing slice: tokens/.raw/${part}.json\n` +
        `Run scripts/export-tokens.figma.js with PART = '${part}' through use_figma and save its result there.`
    );
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const doc = { ...META };
for (const part of PARTS) doc[part] = readSlice(part);

// ── Validation ────────────────────────────────────────────────────────────
// Every alias must resolve to a token that exists somewhere in the graph.
// A dangling alias compiles into var(--nothing) and fails silently at runtime,
// which is exactly the class of bug worth catching here.
const known = new Set();
for (const part of PARTS) {
  for (const name of Object.keys(doc[part].tokens)) known.add(name);
}

const isAlias = (v) => typeof v === 'string' && /^\{.+\}$/.test(v);
const problems = [];

function checkValue(where, value) {
  if (isAlias(value)) {
    const target = value.slice(1, -1);
    if (!known.has(target)) problems.push(`${where} -> {${target}} does not exist`);
  }
}

for (const part of PARTS) {
  for (const [name, value] of Object.entries(doc[part].tokens)) {
    if (part === 'effects') {
      if (!Array.isArray(value.layers) || value.layers.length === 0) {
        problems.push(`effects/${name} has no layers`);
        continue;
      }
      value.layers.forEach((l, i) => {
        checkValue(`effects/${name}[${i}].color`, l.color);
        if (!isAlias(l.color)) problems.push(`effects/${name}[${i}].color is a literal, not an alias`);
        for (const k of ['x', 'y', 'blur', 'spread']) {
          if (typeof l[k] !== 'number') problems.push(`effects/${name}[${i}].${k} is not a number`);
        }
      });
    } else if (value && typeof value === 'object') {
      for (const [mode, v] of Object.entries(value)) checkValue(`${part}/${name}[${mode}]`, v);
    } else {
      checkValue(`${part}/${name}`, value);
    }
  }
}

// Every dial must declare the modes its tokens actually carry.
for (const part of PARTS) {
  if (part === 'effects') continue;
  const modes = doc[part].modes;
  if (!Array.isArray(modes) || modes.length === 0) problems.push(`${part} declares no modes`);
}

if (problems.length) {
  console.error(`Refusing to write ${OUTPUT.replace(ROOT + '/', '')} — ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  if (problems.length > 20) console.error(`  ...and ${problems.length - 20} more`);
  process.exit(1);
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');

const counts = PARTS.map((p) => `${p} ${Object.keys(doc[p].tokens).length}`).join(', ');
const total = PARTS.reduce((a, p) => a + Object.keys(doc[p].tokens).length, 0);
console.log(`Wrote ${OUTPUT.replace(ROOT + '/', '')} — ${counts} (${total} tokens).`);
