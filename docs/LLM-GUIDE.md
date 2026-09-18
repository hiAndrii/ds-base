# LLM Guide

Rules for an AI agent building or editing UI with Design System Base. Follow these
literally. They are ordered by how often violating them causes damage.

**Figma file key:** `U0rO0mELR8c3dvZQQ4Gi9q`

---

## 1. Hard rules

1. **Never write a literal colour, spacing, radius or font size into a component.**
   Bind a variable. If no semantic token fits, create the token first.
2. **Never bind a primitive to a node.** Primitives (`indigo/600`, `dimension/16`)
   have empty scopes and exist only to be aliased. Bind `bg/accent`, `space/md`.
3. **Never add a variant per icon.** Use an `INSTANCE_SWAP` property.
4. **Never use a value that is not a multiple of 4** for spacing, sizing or radius.
   Stroke widths (1, 1.5, 2, 3) and font sizes are the only exemptions.
5. **Never detach an instance.** Override the property instead.
6. **Never set an explicit width on a hug component** (Button, Badge).
7. **`figma.createAutoLayout()` gives the frame a default WHITE fill.** Set
   `frame.fills = []` on every layout container you create, or bind it to a token.
   A stray white fill is invisible in Light and destroys the layout in Dark.
8. **Set sizing modes AFTER `resize()`.** `resize()` silently resets
   `primaryAxisSizingMode` to `FIXED`. Setting hug first and resizing after leaves
   the component stuck at a fixed width and its content overflowing. Always:
   `resize(w, h)` → `layoutSizingHorizontal = 'HUG'`.
9. **Any component that pairs an icon with a label needs the optical wrapper** —
   see §4. Never compensate by padding the icon.
10. **Labelled controls follow the Label rule.** A field control (value lives inside
    a box) OWNS its label node and gets `Show label` on by default plus `Required`.
    A selection control ships bare and is paired through a `… Field` molecule that
    nests an exposed Label instance. Never nest Label inside a field control — the
    exposed nested `Size`/`State` desyncs from the parent. See docs/LABEL-RULE.md.
11. **Per-variant component-property defaults do not survive `combineAsVariants`.**
    They collapse to the first variant's value. Anything a state must show on its
    own — a spinner, an error message — is a NODE whose `visible` you set
    directly, with no property reference. Switching a variant on an existing
    instance also keeps the user's overrides, so a property-driven state is
    invisible twice over.
12. **`clone()` on a variant drops every `componentPropertyReferences`.** After
    cloning a variant to build a new state, re-wire the references by hand or the
    new variant silently ignores Label, icon and visibility properties.
13. **A spread-only drop shadow (radius 0) is not painted unless the node has
    `clipsContent = true`.** Node type is irrelevant — COMPONENT and FRAME behave
    identically, and the parent's clipping does not matter. Blurred shadows are
    unaffected, which is why elevation never exposes this and a focus ring
    always does. A shadow is also cast by the node's *fill*: a transparent node
    casts nothing, so a Ghost-style control needs a fill in its focus state.
    Verify with a screenshot — the effect reads back as present either way.
14. **A blocking state renders on the disabled palette.** `Loading`, and any other
    state that suspends interaction, uses `bg/disabled` / `text/disabled` /
    `icon/disabled` plus a motion affordance — never the live palette. A control
    that still looks pressable while it is not is the bug this rule exists to
    prevent. Semantics stay separate: `aria-busy`, not a permanent `disabled`.
15. **A binary state is a BOOLEAN property; a multi-value state is a variant
    axis.** Where the true and false states look different, add an absolutely-
    positioned overlay inside each variant and reference the boolean from its
    `visible`.
15a. **Figma has no logic between properties — a dependency between two booleans
    must be built as containment.** Nest the dependent layer inside the one it
    depends on, so hiding the parent hides it too whatever its own toggle says.
    Siblings can contradict each other (Checkbox showing a dash while unchecked);
    a nested pair cannot. Nesting also resolves the both-on case by z-order.
16. **A boolean cannot be forwarded into a nested instance.** A molecule that
    needs to drive an atom's boolean holds one pre-set instance per appearance,
    with the molecule's own boolean on each one's `visible` — and mirrors the
    atom's nesting, or the dependency stops holding at the molecule level.
17. **`componentPropertyReferences` cannot be set on an instance's sublayers.**
    When restoring references after `clone()`, stop the walk at every INSTANCE —
    the instance node itself takes references, its children throw.
18. Every new component must be added to a Theme Lab specimen and checked against
    Shape `Sharp` + `Rounded`, Theme `Dark`, Density `Compact` and Typography
    `Editorial` before it is called done.
19. **When reading bindings, descend into hidden nodes and nested instances.**
    `figma.skipInvisibleInstanceChildren` defaults to `true` in the plugin
    environment, so a traversal silently drops the children of any instance whose
    `visible = false` — and the properties you most need often live exactly there.
    A Button's icon colour, for example, is bound on the child `Vector` **inside**
    the `Icon left` / `Icon right` instances, which ship hidden (`Show icon = off`);
    a naive walk reports "no binding" and the whole per-variant icon palette goes
    invisible. Figma's own Selection-colors panel shows these, which is why a
    binding can be real yet absent from your read. Set
    `figma.skipInvisibleInstanceChildren = false` before any binding audit, walk
    through `INSTANCE` children, and read the colour off the leaf `Vector`
    (fill or stroke), not off the instance. When a read disagrees with what the
    Figma UI shows, suspect the reader before the data.
20. **Motion comes from tokens, never literals.** Durations and easing live in
    `7. Motion` and compile to `--duration-*` / `--easing-*`. Write
    `transition: background-color var(--duration-base) var(--easing-standard)`, never
    a literal `200ms` or `cubic-bezier(...)`. **Never `transition: all`** — enumerate
    the properties, and keep the focus-ring `box-shadow` out of every transition list
    so `:focus-visible` stays instant (WCAG 2.4.7). Do not add per-component
    `prefers-reduced-motion` queries — `tokens.css` zeroes transition durations
    globally; only `duration/spinner` (a loop) is exempt, so keep loop periods on
    that token.

---

## 2. Picking the right token

Work from the question, not from the palette.

| You need | Use |
|---|---|
| The page background | `bg/canvas` |
| A card or panel behind content | `bg/surface` |
| A hovered row | `bg/surface-hover` |
| A filled primary button | `bg/accent` + `text/on-accent` |
| A quiet tinted chip or callout | `bg/accent-subtle` + `text/accent` |
| A secondary button fill | `bg/neutral` + `text/primary` |
| Body copy | `text/primary` |
| Supporting copy, captions | `text/secondary` |
| Metadata, timestamps | `text/tertiary` |
| Empty field hint | `text/placeholder` |
| A default 1px border | `border/default` |
| The border of a focused control | `border/focus` + `Focus/Ring` |
| The border of an invalid control | `border/danger` |
| Gap between related items | `space/xs` or `space/sm` |
| Padding inside a card | `space/lg` |
| Gap between page sections | `space/3xl` |
| Control height | `size/control/sm|md|lg` |
| Icon inside a control | `size/icon/sm|md|lg` |

**Foreground on a filled surface** — read the fill, then pick:

| Fill | Foreground |
|---|---|
| `bg/accent` | `text/on-accent` · `icon/on-accent` |
| `bg/danger`, `bg/info` | `text/on-solid` · `icon/on-solid` |
| `bg/success` | `text/on-success` |
| `bg/warning` | `text/on-warning` |
| `bg/inverse` | `text/on-inverse` · `icon/on-inverse` |

**Every solid fill carries a white label.** All the `on-*` tokens above resolve to
white except `text/on-inverse`, which flips with the theme. If you ever find
yourself reaching for a dark foreground on a coloured fill, the fill is wrong —
move it one ramp step deeper instead. Solid fills are also identical in Light and
Dark for the same reason; do not "brighten them for dark mode".

---

## 3. Plugin API recipes

Every snippet assumes the collection ids below. Re-read them if the file changes.

```js
const COLL = {
  primitives: "VariableCollectionId:3:2",   // 1. Primitives  — never bind these
  brand:      "VariableCollectionId:3:3",   // 2. Brand       — reached through Theme
  theme:      "VariableCollectionId:3:4",   // 3. Theme       — all colour
  space:      "VariableCollectionId:3:5",   // 4. Space & Size
  typography: "VariableCollectionId:3:6",   // 6. Typography
  shape:      "VariableCollectionId:43:2",  // 5. Shape       — all radius
};
```

Radius tokens live in **Shape**, not Brand. Typeface tokens (`font/display`,
`font/body`, `font/mono`) live in **Typography**, not Brand. Brand is colour only.

### Build a token lookup

```js
const all = await figma.variables.getLocalVariablesAsync();
const V = {};
for (const v of all) {
  const c = v.variableCollectionId;
  if (c === COLL.theme || c === COLL.space || c === COLL.shape) V[v.name] = v;
}
```

Bind components to Theme, Space & Size and Shape. Brand and Typography are reached
indirectly — Theme aliases Brand, and text styles carry Typography.

### Bind a fill, stroke or text colour

```js
const paint = (token) => figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[token]);

node.fills   = [paint('bg/surface')];
node.strokes = [paint('border/default')];
textNode.fills = [paint('text/primary')];
```

`setBoundVariableForPaint` returns a **new** paint. Capture it — mutating the
existing array does nothing.

### Bind geometry

```js
node.setBoundVariable('height', V['size/control/md']);
node.setBoundVariable('paddingLeft',  V['space/md']);
node.setBoundVariable('paddingRight', V['space/md']);
node.setBoundVariable('itemSpacing',  V['space/xs']);
node.setBoundVariable('strokeWeight', V['border-width/thin']);
for (const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])
  node.setBoundVariable(k, V['radius/md']);
```

Corner radius must be bound per corner. `cornerRadius` is not bindable.

### Pin modes on a frame

```js
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const pin = (collName, modeName) => {
  const c = colls.find(x => x.name === collName);
  frame.setExplicitVariableModeForCollection(c, c.modes.find(m => m.name === modeName).modeId);
};
pin("2. Brand", "Healthcare");
pin("3. Theme", "Dark");
pin("4. Space & Size", "Compact");
pin("5. Shape", "Rounded");
pin("6. Typography", "Editorial");
```

Always pin **all five** on a top-level artboard. Unpinned frames follow collection
defaults and drift when the defaults change.

Pinning a Typography mode re-typesets the subtree, so every family/style those modes
can resolve to must be loaded first — Geist, Plus Jakarta Sans, IBM Plex Sans and
Manrope in `Regular`/`Medium`/`SemiBold`/`Bold`, plus Geist Mono and JetBrains Mono
in `Regular`/`Medium`. Skipping this throws on `setExplicitVariableModeForCollection`.

### Recolour an icon instance

```js
iconInstance.children[0].strokes = [paint('icon/on-accent')];
```

The single child is always named `Vector`, which is what lets the override survive a
swap.

### Apply a text style

```js
const styles = Object.fromEntries(
  (await figma.getLocalTextStylesAsync()).map(s => [s.name, s.id]));
await textNode.setTextStyleIdAsync(styles['Body/MD']);
textNode.fills = [paint('text/primary')];
```

Load the font before touching `characters`. Brand families are Geist, Plus Jakarta
Sans, Manrope, IBM Plex Sans, Instrument Sans (styles `Regular`, `Medium`,
`SemiBold`, `Bold`) and Geist Mono, JetBrains Mono.

---

## 4. Optical balance for icon + label

An icon on a 24px grid uses a 20px live area — ~2px of built-in whitespace per side.
Equal padding therefore makes the icon side read looser and the label look shoved
against the opposite edge.

**The fix**: wrap the label in its own auto-layout frame with `space/optical` (2px)
horizontal padding. One wrapper pushes the text off its outer edge AND opens the
icon-to-label gap. The icon is untouched, so the correction survives a swap.

```js
const wrap = figma.createAutoLayout('HORIZONTAL', { name: 'Label' });
wrap.primaryAxisAlignItems = 'CENTER';
wrap.counterAxisAlignItems = 'CENTER';
wrap.fills = [];
component.insertChild(labelIndex, wrap);
wrap.setBoundVariable('paddingLeft',  V['space/optical']);
wrap.setBoundVariable('paddingRight', V['space/optical']);
wrap.appendChild(textNode);
textNode.name = 'Text';
textNode.layoutSizingHorizontal = 'HUG';   // or 'FILL' inside an Input
wrap.layoutSizingHorizontal = 'HUG';
wrap.layoutSizingVertical = 'HUG';

// 4px box gap + 2px wrapper + ~2px icon inset reads as ~8px
component.setBoundVariable('itemSpacing', V['space/2xs']);
```

Node naming matters: the wrapper is `Label`, the text inside it is `Text`. The TEXT
component property stays bound to the inner text node.

Applied to Button, Badge and Input. Apply it to any new component that puts an icon
beside a label.

## 5. Adding a component

In this order. Skipping step 1 is what produces components that break on re-skin.

1. List every colour, space and size the component needs. Map each to an existing
   semantic token. Create the missing ones **before drawing**.
2. Choose variant axes — appearance rules only. Content is a component property.
3. Build with auto-layout. Fixed height from `size/control/*`; padding and gap from
   `space/*`; radius from `radius/*`.
4. Add properties: `TEXT` labels, `BOOLEAN` optional parts, `INSTANCE_SWAP` icons.
   Add them to each variant component **before** `combineAsVariants`.
5. After `combineAsVariants`, position every child — they stack at (0,0) otherwise —
   then `resizeWithoutConstraints` the set from the child bounds.
6. Write the component description in the format below.
7. Screenshot and verify against all five dials.

### Description format

Components are read by agents through their description. Use this shape:

```
<Name> — <one-line purpose>.

PROPERTIES
  <Axis>: <values>
  <prop> (text|bool|swap)

WHEN TO USE
  <the decision rule, and which sibling component to use instead>

COMPOSITION
  <what it pairs with, and the gap token between them>

DO NOT
  <the failure modes worth naming>

TOKENS
  <the semantic tokens it consumes>
```

---

## 6. Adding a niche

A niche is 25 aliases in `2. Brand`. Shape and typeface are separate dials and are
NOT part of a niche.

1. Pick an accent hue and a neutral (`gray` cool / `slate` corporate / `sand` warm).
2. Compute white-on-`<hue>/600`. Below 4.5:1 → `accent/contrast = gray/950`.
   Amber, orange, emerald, cyan and lime always fail. Blue, indigo, violet, rose pass.
3. `brandCollection.addMode("<Niche>")`.
4. Fill 25 aliases: `accent/50…950`, `neutral/0…1000`, `accent/contrast`.
5. Add one card to the Brand sweep in Theme Lab. That sweep is the acceptance test.

Nothing in Theme, Space & Size, Shape, Typography or any component changes.

To pair the niche with a look, pick a Shape mode and a Typography mode — see
DESIGN-SYSTEM §6 for the recommended combinations.

## 7. Self-check before finishing

- [ ] No hardcoded hex, spacing, radius or font size anywhere in the component
- [ ] Every spacing / sizing / radius value is a multiple of 4
- [ ] Every fill, stroke and text colour is bound to a `3. Theme` token
- [ ] Foreground matches its fill per the table in §2
- [ ] Icons are `INSTANCE_SWAP`, not variants
- [ ] Variant children were positioned after `combineAsVariants`
- [ ] The component set has a description in the §4 format
- [ ] Sizing modes were set AFTER `resize()` — hug components actually hug
- [ ] Icon + label pairs carry the `space/optical` wrapper on the label
- [ ] No `createAutoLayout` frame left with its default white fill
- [ ] Every state is visibly distinct — check the variant grid, not the data
- [ ] Added to a Theme Lab specimen
- [ ] Labelled control? Field controls own their label; selection controls get a `… Field` molecule
- [ ] Renders correctly in Shape `Sharp` + `Rounded`, Theme `Dark`, Density `Compact`, Typography `Editorial`

---

## 8. Theme Lab

`Theme Lab` is the page that proves the dials resolve. Two components —
`Theme Lab / Specimen` (settings-panel atoms) and `Theme Lab / Specimen B` (controls
and media) — each instanced 21 times across five sweeps: Brand (8), Color (2),
Shape (4), Density (3), Typography (4). Together they cover all 20 atoms.

**Rules when you touch it**

1. One component, many instances. Never duplicate and edit a card.
2. A sweep changes exactly one dial; everything else sits at the baseline
   (Brand `Base`, Theme `Light`, Density `Default`, Shape `Soft`, Typography `Studio`).
3. Every instance pins all five modes explicitly, including the ones it is not
   testing.
4. Every new atom goes into one of the two specimens. If it cannot go in without
   special-casing, its API is wrong.
5. Nothing in a card is hardcoded. A card needing a value the tokens lack is a
   finding — add the token.

**Adding a card to a sweep**

```js
const card = await figma.getNodeByIdAsync("46:4");     // Theme Lab / Specimen
const inst = card.createInstance();
row.appendChild(inst);
pin(inst, { "2. Brand": "Fintech" });                   // one dial differs
inst.setProperties({ [kTitle]: "FINTECH", [kCaption]: "Soft · Default · Studio" });
```

**Do not** rebuild the lab after a token change — it re-renders itself.
