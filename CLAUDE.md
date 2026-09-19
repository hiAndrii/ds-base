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

Process for every task:
1. Investigate read-only. Show a plan naming every file and every Figma
   node you will touch.
2. WAIT for an explicit "go". Write nothing before it.
3. Execute.
4. Report what changed and run the sync checklist below.

Never hand-edit generated files: tokens/tokens.json, src/styles/tokens.css.
Never bind a primitive. Every Figma write is followed by a read-back.
When reading Figma bindings, set skipInvisibleInstanceChildren = false —
hidden nodes carry real bindings.
If a name, unit or default is ambiguous, ask instead of guessing.

Work on a feature branch. Small commits, conventional prefixes.
Do not mix a system change and a component change in one branch.

## Sync checklist

Figma changed        → re-export the affected PART(s) → npm run export → npm run tokens
Token added/renamed  → DESIGN-SYSTEM §4.x, LLM-GUIDE §2 table, ATOMS TOKENS lines
Component changed    → ATOMS.md → .tsx / .module.css → components.html
Always               → npm run typecheck && npm run build, and check the
                       sandbox in Dark, Compact, Sharp, Editorial

## Figma is not the contract

Some things in the Figma file exist only because of its renderer and are
deliberately not reproduced in code. Before porting, check DESIGN-SYSTEM §10.
Known cases: the bg/surface fill on Outline and Ghost in Focus; clipsContent
on Focus variants; Smart Animate tweening the palette on the loading flip.