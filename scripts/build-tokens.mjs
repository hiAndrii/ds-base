#!/usr/bin/env node
// Compiles tokens/tokens.json into src/styles/tokens.css.
// Pure Node, zero dependencies. Run with `npm run tokens`.
//
// How it works
// ------------
// The token graph has six collections. Primitives are the raw values and are
// emitted with a `--p-` prefix so they can never be referenced by accident.
// The five dials (Brand, Theme, Space & Size, Shape, Typography) each map to a
// data-* attribute on <html>. Their default modes land in :root so a page with
// no attributes renders correctly; every mode also gets its own attribute
// selector so a dial can be overridden anywhere in the tree.
//
// Values are emitted as var() references, never resolved, so the cascade does
// the work: switch data-brand and every token that aliases the accent ramp
// follows, with no rebuild.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT = resolve(ROOT, 'tokens/tokens.json');
const OUTPUT = resolve(ROOT, 'src/styles/tokens.css');

// Each dial collection -> the attribute it drives and its default mode.
// The default mode is written to :root so an attribute-less page is correct.
// `guard` is a prefix that marks a tier as not-public. Primitives carry --p-,
// Brand carries --b-: both exist only so the tier above them can resolve, and
// neither is something a component may reference. It mirrors their empty
// `scopes` in Figma, where they are equally unreachable.
const DIALS = {
  brand: { attr: 'data-brand', default: 'Base', guard: 'b-' },
  theme: { attr: 'data-theme', default: 'Light', guard: '' },
  space: { attr: 'data-density', default: 'Default', guard: '' },
  shape: { attr: 'data-shape', default: 'Soft', guard: '' },
  typography: { attr: 'data-type', default: 'Studio', guard: '' },
};

// Figma style strings -> numeric CSS font-weight. Weight tokens alias
// font-style primitives ("SemiBold"), which are not valid CSS font-weight
// values, so we remap them to the numeric scale the primitives already define.
const FONT_WEIGHT = {
  Light: 300,
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
};

// Numbers in these groups are unitless (ratios / numeric weights).
// Everything else numeric is a pixel measurement.
const UNITLESS_GROUPS = new Set(['opacity', 'font-weight']);

const tokens = JSON.parse(readFileSync(INPUT, 'utf8'));

// Names that live in the guarded tiers. Used to decide which prefix an alias
// resolves to. Token names are unique across collections — `radius/md` is Shape,
// `radius/12` is a primitive — so an exact-name lookup is unambiguous.
const primitiveNames = new Set(Object.keys(tokens.primitives.tokens));
const brandNames = new Set(Object.keys(tokens.brand.tokens));
const guardFor = (name) =>
  primitiveNames.has(name) ? 'p-' : brandNames.has(name) ? 'b-' : '';

const isAlias = (v) => typeof v === 'string' && /^\{.+\}$/.test(v);
const aliasTarget = (v) => v.slice(1, -1); // "{indigo/50}" -> "indigo/50"
const group = (name) => name.split('/')[0]; // "font-size/14" -> "font-size"

// "bg/canvas" -> "--bg-canvas"; guarded tiers get their prefix.
const varName = (name, guard = '') => `--${guard}${name.replaceAll('/', '-')}`;

// Turn a token value into the right-hand side of a CSS declaration.
function formatValue(name, value) {
  // Weight tokens: resolve the aliased font-style, then remap to a number.
  if (name.endsWith('/weight') && isAlias(value)) {
    const style = tokens.primitives.tokens[aliasTarget(value)];
    if (style in FONT_WEIGHT) return String(FONT_WEIGHT[style]);
    throw new Error(`Unknown font-style "${style}" for ${name}`);
  }

  if (isAlias(value)) {
    const target = aliasTarget(value);
    return `var(${varName(target, guardFor(target))})`;
  }

  if (typeof value === 'number') {
    if (UNITLESS_GROUPS.has(group(name))) return String(value);
    return `${value}px`;
  }

  // Raw strings. Font families may contain spaces, so quote them.
  if (group(name) === 'font-family') return JSON.stringify(value);
  return value; // hex colours, font-style strings
}

// Build "  --name: value;" lines for a flat { name: value } map.
function declarations(map, guard = '') {
  return Object.entries(map)
    .map(([name, value]) => `  ${varName(name, guard)}: ${formatValue(name, value)};`)
    .join('\n');
}

// Primitive declarations, all with the --p- prefix.
function primitiveDeclarations() {
  return Object.entries(tokens.primitives.tokens)
    .map(([name, value]) => `  ${varName(name, 'p-')}: ${formatValue(name, value)};`)
    .join('\n');
}

// One effect style -> a full box-shadow value.
// Geometry is baked in; the colour stays a var() reference to a Theme token, so
// switching data-theme re-resolves the shadow without a rebuild. That is the
// whole reason the colour is stored as an alias rather than a literal.
function shadowValue(name, layers) {
  return layers
    .map((l) => {
      const inset = l.type === 'inset' ? 'inset ' : '';
      return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${formatValue(name, l.color)}`;
    })
    .join(', ');
}

// One mode of a dial collection -> a flat { name: value } map.
function modeMap(collection, mode) {
  const out = {};
  for (const [name, byMode] of Object.entries(collection.tokens)) {
    out[name] = byMode[mode];
  }
  return out;
}

const blocks = [];

blocks.push(
  `/* Generated by scripts/build-tokens.mjs — do not edit by hand. */\n` +
    `/* Source: tokens/tokens.json */`
);

// :root — primitives first, then each dial's default mode.
const rootParts = [primitiveDeclarations()];
for (const [key, cfg] of Object.entries(DIALS)) {
  rootParts.push(`  /* ${key}: ${cfg.default} (default) */`);
  rootParts.push(declarations(modeMap(tokens[key], cfg.default), cfg.guard));
}

// Effect styles are not a dial — the geometry is the same in every mode, so
// they are written once. Only their colour moves, and it moves on its own.
if (tokens.effects) {
  rootParts.push(`  /* effects: geometry fixed, colour follows the theme */`);
  rootParts.push(
    Object.entries(tokens.effects.tokens)
      .map(([name, def]) => `  ${varName(name)}: ${shadowValue(name, def.layers)};`)
      .join('\n')
  );
}

blocks.push(`:root {\n${rootParts.join('\n')}\n}`);

// One selector per mode of every dial, so any dial can be set in a subtree.
for (const [key, cfg] of Object.entries(DIALS)) {
  for (const mode of tokens[key].modes) {
    const selector = `[${cfg.attr}="${mode.toLowerCase()}"]`;
    blocks.push(`${selector} {\n${declarations(modeMap(tokens[key], mode), cfg.guard)}\n}`);
  }
}

const css = blocks.join('\n\n') + '\n';

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, css, 'utf8');

console.log(
  `Wrote ${OUTPUT.replace(ROOT + '/', '')} — ${primitiveNames.size} primitives, ` +
    `${Object.keys(DIALS).length} dials, ` +
    `${tokens.effects ? Object.keys(tokens.effects.tokens).length : 0} effect styles.`
);
