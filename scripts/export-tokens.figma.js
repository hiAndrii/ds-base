// Exports one slice of the Figma token graph as JSON.
//
// This file is NOT run by Node. It is a read-only Figma Plugin API script that
// runs inside the Figma file, through the MCP `use_figma` tool. There is no
// other supported path: the graph lives in Figma and only the Plugin API can
// read variable modes, alias targets and effect-style geometry.
//
// Usage
// -----
//   1. Set PART below to one slice.
//   2. Run this whole file through `use_figma` against the design system file.
//   3. Save the returned JSON to tokens/.raw/<PART>.json
//   4. Repeat for all eight slices, then `npm run export`.
//
// Why one slice at a time: `use_figma` truncates its result at roughly 20 KB
// and the assembled graph is ~47 KB. Every individual slice fits comfortably.
//
// This script never writes. It is safe to run at any time.

const PART = 'primitives'; // primitives | brand | theme | space | shape | typography | motion | effects

// Figma collection name -> the key it occupies in tokens.json.
const COLLECTION_OF = {
  primitives: '1. Primitives',
  brand: '2. Brand',
  theme: '3. Theme',
  space: '4. Space & Size',
  shape: '5. Shape',
  typography: '6. Typography',
  motion: '7. Motion',
};

const vars = await figma.variables.getLocalVariablesAsync();
const byId = new Map(vars.map((v) => [v.id, v]));

// Figma stores floats as float32, so -0.6 reads back as -0.6000000238418579.
// Round before serialising or the file churns on every export.
const num = (n) => Math.round(n * 10000) / 10000;

const hex = (c) => {
  const h = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  const rgb = `${h(c.r)}${h(c.g)}${h(c.b)}`;
  const a = c.a === undefined || c.a >= 1 ? '' : h(c.a);
  return `#${rgb}${a}`.toUpperCase();
};

// A value is either an alias to another token, or a literal.
const render = (value) => {
  if (value && value.type === 'VARIABLE_ALIAS') {
    const target = byId.get(value.id);
    if (!target) throw new Error(`Alias points at a missing variable: ${value.id}`);
    return `{${target.name}}`;
  }
  if (value && typeof value === 'object' && 'r' in value) return hex(value);
  if (typeof value === 'number') return num(value);
  return value;
};

async function exportCollection(part) {
  const wanted = COLLECTION_OF[part];
  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const coll = colls.find((c) => c.name === wanted);
  if (!coll) throw new Error(`Collection not found: ${wanted}`);

  const modes = coll.modes.map((m) => m.name);
  const singleMode = modes.length === 1;
  const tokens = {};

  // Preserve the collection's own variable order — it is the authored order.
  for (const id of coll.variableIds) {
    const v = byId.get(id);
    if (!v) continue;
    if (singleMode) {
      // One mode collapses to a bare value, matching the primitives block.
      tokens[v.name] = render(v.valuesByMode[coll.modes[0].modeId]);
    } else {
      const perMode = {};
      for (const m of coll.modes) perMode[m.name] = render(v.valuesByMode[m.modeId]);
      tokens[v.name] = perMode;
    }
  }
  return { modes, tokens };
}

async function exportEffects() {
  const styles = await figma.getLocalEffectStylesAsync();

  // "Elevation/2XL" -> "elevation/2xl", "Focus/Ring Danger" -> "focus/ring-danger".
  // Normalising here keeps the compiler's varName() a one-liner that only has
  // to know about slashes.
  const key = (name) => name.toLowerCase().replace(/\s+/g, '-');

  const tokens = {};
  for (const s of styles) {
    tokens[key(s.name)] = {
      layers: s.effects
        .filter((e) => e.visible !== false)
        .map((e) => {
          if (e.type !== 'DROP_SHADOW' && e.type !== 'INNER_SHADOW') {
            throw new Error(`${s.name}: unsupported effect type ${e.type}`);
          }
          const bound = e.boundVariables && e.boundVariables.color;
          if (!bound) {
            throw new Error(`${s.name}: shadow colour is not bound to a variable`);
          }
          const target = byId.get(bound.id);
          if (!target) throw new Error(`${s.name}: colour variable missing`);
          return {
            type: e.type === 'INNER_SHADOW' ? 'inset' : 'drop',
            x: num(e.offset.x),
            y: num(e.offset.y),
            blur: num(e.radius),
            spread: num(e.spread),
            color: `{${target.name}}`,
          };
        }),
    };
  }
  return { tokens };
}

if (PART === 'effects') return await exportEffects();
if (!(PART in COLLECTION_OF)) throw new Error(`Unknown PART: ${PART}`);
return await exportCollection(PART);
