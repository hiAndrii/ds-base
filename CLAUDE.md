# Design System Base — working agreement

## What this repo is
A token-driven design system. The source of truth for tokens is
`tokens/tokens.json`, exported from Figma. The docs in `docs/` are normative.

## The token pipeline
```
Figma  --(scripts/export-tokens.figma.js, via MCP use_figma)-->  tokens/.raw/*.json
tokens/.raw/*.json  --(npm run export)-->  tokens/tokens.json
tokens/tokens.json  --(npm run tokens)-->  src/styles/tokens.css
```
`export-tokens.figma.js` is not run by Node — it is a read-only Figma Plugin API
script, executed inside the Figma file through the MCP `use_figma` tool, one slice
at a time (the transport truncates at ~20 KB; the whole graph is ~47 KB). Save each
result to `tokens/.raw/<part>.json`, then run `npm run export`, which validates that
every alias resolves before it writes anything.

Figma Code syntax mirrors the compiler: the public dials carry `var(--name)` with
slashes turned into hyphens; Primitives and Brand carry none, because they are not
public API and appear in CSS only under the `--p-` and `--b-` guard prefixes.

## Read before changing anything
- docs/LLM-GUIDE.md — hard rules for agents. Follow them literally.
- docs/DESIGN-SYSTEM.md — architecture, naming, full token reference
- docs/ATOMS.md — component API reference
- docs/LABEL-RULE.md — label ownership rule

## Hard rules, restated for code
1. Never write a literal colour, spacing, radius or font size in a component.
   Reference a semantic token.
2. Never reference a primitive directly. Primitives exist only to be aliased.
3. Spacing, sizing and radius are multiples of 4. Stroke widths, font sizes
   and space/optical are the documented exemptions.
4. The five dials are independent. Never couple them.
5. If no semantic token fits, create the token first, then use it.

## The five dials map to attributes on <html>
data-brand · data-theme · data-density · data-shape · data-type

## Working agreement
- If a unit, name or default is ambiguous, ask. Do not guess.
- After each change, explain what changed and why.
- Small commits. Conventional prefixes: feat, fix, docs, chore, refactor.
- Never hand-edit tokens/tokens.json or src/styles/tokens.css — both are generated.
  Change Figma, re-export, recompile.