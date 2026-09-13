# Design System Base — working agreement

## What this repo is
A token-driven design system. The source of truth for tokens is
`tokens/tokens.json`, exported from Figma. The docs in `docs/` are normative.

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
- Never hand-edit tokens/tokens.json — it is generated from Figma.