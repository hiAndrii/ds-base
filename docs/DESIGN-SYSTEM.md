# Design System Base — Architecture

> The reasoning, the rules, and the full token reference.
> Written to be read equally well by a designer and by a language model.

---

## 1. Principles

These are the rules the system is built on. Every decision below traces back to one
of them.

### 1.1 Tokens are a chain of decisions, not a list of values

A raw hex is a fact. A token is a decision *about* that fact. The value of a design
system is in the decisions, so each one gets its own layer:

| Layer | Question it answers | Example |
|---|---|---|
| Primitive | What values exist at all? | `indigo/600 = #4F46E5` |
| Dial | Which of them is *ours*? | `accent/600 → indigo/600` · `radius/md → radius/12` |
| Theme | What does that mean on this surface? | `bg/accent → accent/solid` |
| Component | What does this button use? | `fill → bg/accent` |

There are five dials, not one. **Brand** answers the colour question, **Shape** the
roundness question, **Typography** the typeface question, **Space & Size** the
density question, **Theme** the light/dark question.

Collapsing two layers looks like a simplification and always costs you later. If
`Button.fill` points straight at `indigo/600`, re-skinning means editing every
component. If it points at `bg/accent`, re-skinning is a mode switch.

### 1.2 Name tokens by role, never by appearance

`text/danger`, not `text/red`. The name has to survive a redesign. When Banking's
error colour becomes crimson, `text/danger` is still correct and `text/red` is a lie
that no one dares rename because 200 components depend on it.

Semantic names also make the system legible to a model: an agent reading
`bg/accent-subtle` knows what it is for. Reading `bg/indigo-50` it can only guess.

### 1.3 Primitives are hidden; semantics are the public API

Every primitive has `scopes = []`, so it appears in no Figma picker. A designer
physically cannot reach `indigo/600`. This is what keeps the system from eroding —
the guardrail is structural, not a convention people are asked to remember.

### 1.4 Independent dials stay independent

Niche and density are different questions. A Healthcare product can be dense; an AI
product can be airy. They are two collections with two mode axes, not one enum with
24 combinations. Cross-multiplying independent concerns is how token sets reach a
thousand entries and stop being maintainable.

### 1.5 One measurement grid

Every spacing, sizing and radius value is a multiple of 4. No exceptions in the
layout system. Three things are deliberately outside it:

- **Stroke widths** (1, 1.5, 2, 3) — hairlines are a rendering concern, not a layout one.
- **Font sizes** (11, 13, 14, 18) — type scales are tuned optically; forcing them onto
  a 4pt grid produces bad typography. Line-heights *are* on the grid, which is what
  keeps vertical rhythm intact.
- **`space/optical` (2px)** — an optical correction, not a layout decision. See §1.6.

Each exemption is a *rendering* concern. The grid governs layout, and layout only.

### 1.6 Optical correction is measured, not eyeballed

An icon drawn on a 24px grid occupies a 20px live area — its box carries ~2px of
built-in whitespace on every side. Give a button equal padding on both ends and the
icon side reads looser, while the label looks shoved against the opposite edge. The
geometry is symmetric; the perception is not.

The correction is a 2px auto-layout wrapper on the **label only**. One wrapper does
two jobs at once: it pushes the text off its outer edge by the amount the icon
already had, and it opens the icon-to-label gap. The icon is never touched, so the
correction cannot drift when an icon is swapped.

This is why the box gap between icon and label is `space/2xs` (4px) and not 8px —
with the wrapper's 2px plus the icon's own ~2px inset, 4px of box gap reads as
roughly 8px of air. Measure the live area, then compensate for it. Do not nudge.

Applied to: Button, Badge, Input.

### 1.7 Component variants encode state; component properties encode content

A variant axis is for things that change the component's *appearance rules*
(`Variant`, `Size`, `State`). A component property is for things that change its
*contents* (`Label`, `Icon left`, `Show status`). Putting content in variants is the
single fastest way to a 400-variant component set nobody can use.

**A binary state is a boolean, not a two-value axis.** The axis/property split is
about appearance versus content, but it is crossed by a second question: how many
values are there? A dropdown to choose between true and false costs a click and a
read every time, and multiplies the variant count by two for nothing. Checkbox's
`Checked` and `Indeterminate` are booleans for that reason. Where the two states
look different, express each as an absolutely-positioned overlay whose visibility
the boolean drives. `State` stays an axis: five values, and each repaints the
whole control.

**Dependencies between booleans are expressed by containment.** Figma has no
logic between properties — nothing fires when one is switched off. So when one
state is a refinement of another (indeterminate is a kind of checked, not an
alternative to it), nest the dependent layer *inside* the one it depends on.
Hiding the parent takes the child with it regardless of the child's own toggle,
which is the only way to keep two booleans from contradicting each other. It also
disposes of the both-on case, since the inner layer covers the outer one.

### 1.8 Accessibility is a token decision, not a review step

White on emerald/600 is 3.7:1 — a fail. There are two ways to fix that: darken the
text, or darken the fill. The system darkens the **fill**.

Darkening the text works mathematically and looks wrong: a near-black label on a
bright button reads as disabled, and it forces every consumer to remember which
tones flipped. Darkening the fill keeps one rule instead of eight exceptions:

> **Every solid fill in the system carries a white label.**

So `accent/solid` resolves one ramp step deeper for bright hues (orange, cyan,
emerald, teal) than for blues and violets, and the solid status fills sit at
emerald/700, amber/700, red/600 and blue/600 rather than at their 500s and 600s.
Solid fills also do **not** lighten in Dark mode, because the label is white in both
themes and a lighter fill would drop below 4.5:1.

The correct choice is the default choice, and there is nothing to remember.

---

## 2. Architecture

### 2.1 Collections

| # | Collection | Modes | Vars | Scopes |
|---|---|---|---|---|
| 1 | `1. Primitives` | Value | 260 | `[]` — hidden everywhere |
| 2 | `2. Brand` | Base, Healthcare, AI, Banking, E-commerce, Crypto, Education, Wellness | 28 | `[]` — reached through Theme |
| 3 | `3. Theme` | Light, Dark | 79 | fill / text / stroke / effect |
| 4 | `4. Space & Size` | Default, Compact, Comfortable | 48 | gap / width-height / stroke-float |
| 5 | `5. Shape` | Soft, Crisp, Sharp, Rounded | 9 | corner-radius |
| 6 | `6. Typography` | Studio, Editorial, Technical, Expressive | 79 | font-family / size / line-height / letter-spacing / font-style |
| 7 | `7. Motion` | Value | 4 | `[]` — not node-bound |

**507 variables across seven collections.** Nine effect styles (§4.7) carry the
elevation and focus geometry; they are styles, not variables, and are counted
separately everywhere. The compiler reports 516 because it emits both: 507 + 9.

Five of the seven are the dials of §1.1 — Brand, Theme, Space & Size, Shape and
Typography — each switched from the Appearance panel. Primitives and Motion are
machinery: Primitives are hidden by empty scopes (§1.3), and Motion is
mode-invariant, carrying the same durations and easing under every dial, like
Elevation (§4.7).

### 2.1a Why shape and typeface are their own dials

They began inside Brand — `Healthcare` meant teal *and* Plus Jakarta Sans *and*
generous radii, in one switch. Convenient, and wrong: that produces eight presets,
not a system. A fintech product may want Banking's blue with Rounded corners; an AI
tool may want violet with a Technical typeface.

Splitting them turns 8 presets into 8 × 4 × 4 × 3 = **384 legitimate combinations**
of brand, shape, typography and density — each of which renders in both themes, so
**768 once Light and Dark are counted**. The cost is that a niche is no longer a
single switch, so the recommended combinations are written down instead — see §6.

### 2.2 Why Brand sits between Primitives and Theme

The obvious design puts semantic colour directly on primitives and gives the Theme
collection one mode per niche per theme: `Light`, `Dark`, `Healthcare Light`,
`Healthcare Dark`… That is 16 modes for 8 niches, and every new niche means editing
77 semantic tokens twice.

Inserting Brand collapses it. Brand exposes an 11-step `accent/*` ramp and a 13-step
`neutral/*` ramp. Theme aliases those ramps and knows nothing about hue. A new niche
is 28 aliases in one collection — Theme is untouched, and both themes get it free.

```
Theme::bg/accent  →  Brand::accent/solid  →  Primitives::indigo/600   (Base)
                                          →  Primitives::teal/700     (Healthcare)
                                          →  Primitives::violet/600   (AI)
```

### 2.3 Why typography binds through variables rather than hardcoding

Each of the 19 text styles has all five properties bound to variables:

```
Heading/LG
  fontFamily    → Typography::font/display
  fontStyle     → Typography::heading-lg/weight
  fontSize      → Typography::heading-lg/size
  lineHeight    → Typography::heading-lg/line-height
  letterSpacing → Typography::heading-lg/tracking
```

Switching a frame to Typography `Editorial` re-typesets every text node in it. No
style swapping, no detaching.

**Font sizes are identical in all four Typography modes.** Character comes from
typeface, leading, tracking and weight — never from size. That is deliberate:
switching typography restyles a finished layout without reflowing it.

This is why every typeface a mode can resolve to shares Figma style names —
`Regular`, `Medium`, `SemiBold`, `Bold`. Inter spells it `Semi Bold`, which breaks
the binding the moment the family changes, so Inter is deliberately *not* one of the
four. It stays in Primitives as an unused `font-family/*` step, as does Instrument
Sans; a primitive no mode aliases costs nothing and keeps the option open. The six
families the modes do resolve to — Geist, Plus Jakarta Sans, IBM Plex Sans, Manrope,
Geist Mono and JetBrains Mono — all agree.

---

## 3. Naming

```
<group>/<role>[-<modifier>][-<state>]
```

| Group | Applies to | Scopes |
|---|---|---|
| `bg/` | frame + shape fills | `FRAME_FILL`, `SHAPE_FILL` |
| `text/` | text fills | `TEXT_FILL` |
| `icon/` | icon strokes + fills | `SHAPE_FILL`, `STROKE_COLOR` |
| `border/` | strokes | `STROKE_COLOR` |
| `effect/` | shadow + ring colours | `EFFECT_COLOR` |
| `space/` | padding + gaps | `GAP` |
| `size/` | widths + heights | `WIDTH_HEIGHT` |
| `radius/` | corner radii | `CORNER_RADIUS` |
| `border-width/` | stroke weights | `STROKE_FLOAT` |

**Modifiers**: `-subtle` (tinted, low emphasis) · `-strong` (raised emphasis) ·
`-raised` / `-sunken` (elevation) · `on-<surface>` (foreground for a specific fill).

**States**: `-hover` · `-active` · `-disabled`. A token without a state suffix is the
rest state.

**Components**: `PascalCase` singular — `Button`, not `Buttons`.
**Variants**: `Property=Value` — `Variant=Primary, Size=MD, State=Default`.
**Icons**: `Icon / kebab-case` — `Icon / chevron-down`.

---

## 4. Token reference

### 4.1 Primitives

| Family | Steps | Purpose |
|---|---|---|
| `gray` | 0, 50–950, 1000 | Neutral, a hair cool. Base + AI + Crypto |
| `slate` | 0, 50–950, 1000 | Cool blue-tinted neutral. Banking |
| `sand` | 0, 50–950, 1000 | Warm neutral. Healthcare, E-commerce, Education, Wellness |
| `blue` `indigo` `violet` `cyan` `teal` `emerald` `amber` `orange` `red` `rose` | 50–950 | Accent + status hues |
| `alpha-black` `alpha-white` | 4, 8, 12, 16, 24, 32, 48, 64, 80 | Scrims, washes, shadows |
| `dimension` | 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 80, 96, 128, 160 | The 4pt grid |
| `radius` | 0, 4, 8, 12, 16, 20, 24, 32, 9999 | Corner radii |
| `font-size` | 10–72 (optical) | Type sizes |
| `line-height` | 12–80 (4pt grid) | Type leading |
| `font-weight` | 300–800 | Numeric weights |
| `font-style` | light, regular, medium, semibold, bold | Figma style strings |
| `font-family` | 8 families | Typefaces |
| `stroke` | 0, 1, 1.5, 2, 3 | Hairlines |
| `opacity` | 0–100 by 10 | Opacity steps |

### 4.2 Brand — the colour dial

Brand carries colour identity and nothing else. 28 tokens: an 11-step `accent/*`
ramp, a 13-step `neutral/*` ramp, `accent/contrast`, and the three filled-surface
steps `accent/solid`, `accent/solid-hover` and `accent/solid-active`.

| Niche | Accent | Neutral | `accent/solid` | White on it |
|---|---|---|---|---|
| Base | indigo | gray (cool) | indigo/600 | 6.3:1 |
| Healthcare | teal | sand (warm) | teal/700 | 5.5:1 |
| AI | violet | gray | violet/600 | 5.7:1 |
| Banking | blue | slate (cool blue) | blue/600 | 5.2:1 |
| E-commerce | orange | sand | orange/700 | 5.2:1 |
| Crypto | cyan | gray | cyan/700 | 5.4:1 |
| Education | rose | sand | rose/600 | 4.7:1 |
| Wellness | emerald | sand | emerald/700 | 5.5:1 |

`accent/solid`, `accent/solid-hover` and `accent/solid-active` are the ramp steps
used for **filled** accent surfaces. Bright hues sit one step deeper than blues and
violets, which is what lets every niche carry a white label (§1.8).

That same step doubles as the accent colour that is legible **as text on a light
surface**, so `text/accent`, `icon/accent` and `border/accent` alias it too. One
token, two contrast problems solved.

`accent/contrast` is the foreground on a solid accent fill. It is `gray/0` in every
niche, and after the niche procedure in §5 it always will be: contrast is fixed by
moving the fill deeper, never by darkening the label (§1.8). So the token is not a
contrast switch. It is a point of indirection — `text/on-accent` and `icon/on-accent`
alias it rather than `gray/0` directly, which is what a niche that deliberately
steps outside §1.8 would need: an accent no fill depth can carry a white label on,
such as a yellow or a lime. That niche is one alias here instead of an edit to
Theme — and §1.8 gets rewritten along with it, because the rule that every solid
fill carries a white label would no longer be true.

Typefaces and corner radii used to live here. They now have their own dials — see
§4.5 and §4.6.

### 4.3 Theme — semantic colour (Light → Dark)

**Surfaces**

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg/canvas` | neutral/0 | neutral/950 | Page background |
| `bg/canvas-subtle` | neutral/50 | neutral/900 | Page background, one step in |
| `bg/surface` | neutral/0 | neutral/900 | Cards, panels, sheets |
| `bg/surface-raised` | neutral/0 | neutral/800 | Surfaces above other surfaces |
| `bg/surface-sunken` | neutral/50 | neutral/950 | Wells, code blocks, insets |
| `bg/surface-hover` | neutral/50 | neutral/800 | Hovered rows and surfaces |
| `bg/surface-active` | neutral/100 | neutral/700 | Pressed surfaces |
| `bg/inverse` | neutral/900 | neutral/50 | Tooltips, inverted chips |
| `bg/overlay` | alpha-black/48 | alpha-black/64 | Modal scrim |
| `bg/disabled` | neutral/100 | neutral/800 | Disabled **and loading** control fill |
| `bg/skeleton` | neutral/100 | neutral/800 | Loading placeholders |
| `bg/track` | neutral/200 | neutral/700 | Slider, switch and progress tracks |
| `bg/hover-overlay` | alpha-black/4 | alpha-white/8 | Wash over transparent controls |
| `bg/active-overlay` | alpha-black/8 | alpha-white/12 | Pressed wash |

**Accent + neutral fills**

| Token | Light | Dark |
|---|---|---|
| `bg/accent` | accent/solid | accent/solid |
| `bg/accent-hover` | accent/solid-hover | accent/solid-hover |
| `bg/accent-active` | accent/solid-active | accent/solid-active |
| `bg/accent-subtle` | accent/50 | accent/950 |
| `bg/accent-subtle-hover` | accent/100 | accent/900 |
| `bg/neutral` | neutral/100 | neutral/800 |
| `bg/neutral-hover` | neutral/200 | neutral/700 |
| `bg/neutral-active` | neutral/300 | neutral/600 |

Accent fills are identical in Light and Dark, and they step *deeper* on hover and
active in both. The three `accent/solid*` steps are chosen per niche so a white
label clears 4.5:1 (§1.8), and a lighter fill in Dark would break exactly that.
An earlier version of the system flipped the direction per theme — see §11.

**Status fills** — `bg/success` (emerald/700) `bg/warning` (amber/700)
`bg/danger` (red/600) `bg/info` (blue/600), each with a `-subtle` tint; danger also
has `-hover` and `-active`. All four are identical in Light and Dark: they carry a
white label in both, and lightening them in Dark would drop below 4.5:1.

**Quiet danger surfaces** — a destructive control that is not a solid button is
transparent at rest and tints on interaction, the way the neutral Outline and Ghost
buttons do. That ladder is:

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg/danger-subtle` | red/50 | red/950 | Rest fill of a tinted container — badge, chip, callout |
| `bg/danger-subtle-hover` | red/50 | red/950 | Hover fill of a control transparent at rest |
| `bg/danger-subtle-active` | red/100 | red/900 | Pressed fill of the same control |

`-hover` carries the same value as `bg/danger-subtle`, which is deliberate: a
control that is transparent at rest has no tint to step away from, so its hover is
the first tint, exactly as the neutral Ghost goes from nothing to `bg/surface-hover`.
The roles are distinct even where the values coincide, as `bg/canvas` and
`bg/surface` are both neutral/0 in Light.

`text/danger` sits one ramp step deeper than the other status text roles — red/700
in Light, red/300 in Dark — because it has to clear 4.5:1 on those tints, where the
other three tones only ever carry text on their own `-subtle` rest fill. On
`bg/danger-subtle` it measures 5.91:1 in Light and 8.51:1 in Dark; on
`bg/danger-subtle-active`, 5.30:1 and 5.28:1.

**This also repairs an existing failure.** Before this change `text/danger` was
red/600, which measured **4.41:1** on `bg/danger-subtle` in Light — below AA. Every
Badge and Chip with `Tone=Danger` and `Style=Subtle` was shipping text under the
threshold. Moving the token fixes those components without touching them.

**Known debt, recorded rather than fixed.**

- **The tones are not symmetric.** After this change danger is the only tone with a
  full `subtle` / `-subtle-hover` / `-subtle-active` set. Accent has `-subtle-hover`
  but no `-subtle-active`; success, warning and info have only `-subtle`. Nothing
  needs the missing steps yet, and adding them speculatively would be eight tokens
  no component references.
- **`text/accent` on accent tints fails AA for two niches.** Education measures
  4.28:1 on `bg/accent-subtle` and 3.91:1 on `bg/accent-subtle-hover`; Banking
  measures 4.24:1 on `bg/accent-subtle-hover`. It is the same defect this section
  fixes for danger, in the accent ramp, for two of the eight brands. Fixing it means
  either deepening `text/accent` per niche or lightening the tints, and it is a
  brand-level decision rather than a token rename.

**Text**

| Token | Light | Dark | Use |
|---|---|---|---|
| `text/primary` | neutral/900 | neutral/50 | Body and headings |
| `text/secondary` | neutral/600 | neutral/400 | Supporting copy, captions |
| `text/tertiary` | neutral/500 | neutral/500 | Metadata, timestamps |
| `text/placeholder` | neutral/400 | neutral/600 | Empty field hints |
| `text/disabled` | neutral/400 | neutral/600 | Disabled and loading labels |
| `text/on-accent` | accent/contrast | accent/contrast | On a solid accent fill |
| `text/on-solid` | gray/0 | gray/0 | On danger / info solids |
| `text/on-success` | gray/0 | gray/0 | On an emerald solid |
| `text/on-warning` | gray/0 | gray/0 | On an amber solid |
| `text/on-inverse` | neutral/0 | neutral/900 | On `bg/inverse` |
| `text/accent` | accent/solid | accent/400 | Links, emphasised text |
| `text/accent-hover` | accent/solid-hover | accent/300 | Hovered link |
| `text/success` `text/warning` `text/info` | 700 | 400 | Status copy |
| `text/danger` | red/700 | red/300 | Status copy — one step deeper than its siblings so it clears AA on the danger tints |

**Icon** — mirrors text: `icon/primary` `secondary` `tertiary` `disabled` `accent`
`on-accent` `on-solid` `on-inverse` `success` `warning` `danger` `info`.

**Border** — `border/subtle` `default` `strong` `inverse` `disabled` `accent`
`accent-subtle` `focus` `success` `warning` `danger` `info`.

**Effect** — `effect/shadow-sm|md|lg|xl` and `effect/focus-ring`. Shadow colours
darken in Dark mode (alpha 8% → 48%) because a shadow tuned for white disappears on
near-black.

### 4.4 Space & Size — the density dial

| Token | Default | Compact | Comfortable |
|---|---|---|---|
| `space/0` | 0 | 0 | 0 |
| `space/2xs` | 4 | 4 | 4 |
| `space/xs` | 8 | 4 | 8 |
| `space/sm` | 12 | 8 | 16 |
| `space/md` | 16 | 12 | 20 |
| `space/lg` | 24 | 16 | 32 |
| `space/xl` | 32 | 24 | 40 |
| `space/2xl` | 40 | 32 | 48 |
| `space/3xl` | 48 | 40 | 64 |
| `space/4xl` | 64 | 48 | 80 |
| `space/5xl` | 96 | 64 | 128 |
| `space/optical` | 2 | 2 | 2 |

| Control height | Default | Compact | Comfortable |
|---|---|---|---|
| `size/control/xs` | 24 | 20 | 28 |
| `size/control/sm` | 32 | 28 | 36 |
| `size/control/md` | 40 | 36 | 48 |
| `size/control/lg` | 48 | 40 | 56 |
| `size/control/xl` | 56 | 48 | 64 |

Density-invariant by design (icons live on a pixel grid; rescaling them per density
degrades rendering):

- `size/icon/*` — 12, 16, 20, 24, 32
- `size/avatar/*` — 24, 32, 40, 48, 64, 96; `status-*` 8, 12, 16, 24 (~25% of the avatar)
- `size/selection/*` — 16, 20; `dot` 8
- `size/switch/*` — track 32×20 / 40×24, knob 12 / 16
- `size/badge/*` — 20, 24
- `border-width/*` — 0, 1, 1.5, 2, 3

`space/optical` is the one Space token that is not an alias to the dimension
scale. It is a literal 2px, and the only value in the system allowed to sit off the
4pt grid for a layout-adjacent reason — see §1.6.

### 4.5 Shape — the roundness dial

Nine radius tokens, four modes. Every value is a multiple of 4; `full` (9999) is the
pill sentinel and the single exception.

| Token | Soft | Crisp | Sharp | Rounded |
|---|---|---|---|---|
| `radius/none` | 0 | 0 | 0 | 0 |
| `radius/xs` | 4 | 4 | 0 | 8 |
| `radius/sm` | 8 | 4 | 0 | 16 |
| `radius/md` | 12 | 8 | 4 | 20 |
| `radius/lg` | 16 | 12 | 4 | 24 |
| `radius/xl` | 20 | 16 | 8 | 32 |
| `radius/2xl` | 24 | 20 | 8 | 32 |
| `radius/3xl` | 32 | 24 | 12 | 32 |
| `radius/full` | pill | pill | pill | pill |

**Soft** is the house default. **Crisp** tightens it for dense product UI. **Sharp**
reads institutional — banking, enterprise, technical. **Rounded** reads consumer —
wellness, education, lifestyle.

Radius carries more personality per unit of effort than any other dial. Change it
before reaching for anything else.

### 4.6 Typography — the type dial

Four modes. Each sets the typefaces and the character of the ramp; **font sizes are
identical in every mode**, so switching typography restyles a layout without
reflowing it.

| Mode | Display + Body | Mono | Character |
|---|---|---|---|
| **Studio** | Geist | Geist Mono | Neutral modern grotesque. The house voice. |
| **Editorial** | Plus Jakarta Sans | JetBrains Mono | Humanist and airy — +4px leading on body roles, looser tracking. |
| **Technical** | IBM Plex Sans | JetBrains Mono | Institutional and tight — lighter display weight, near-zero tracking, wider small-caps. |
| **Expressive** | Manrope | Geist Mono | Geometric and loud — Bold display, tightest tracking. |

**The 19 type roles** (size is constant across modes):

| Role | Size | Line-height (Studio) | Weight (Studio) | Family |
|---|---|---|---|---|
| `display-2xl` | 72 | 80 | SemiBold | display |
| `display-xl` | 56 | 64 | SemiBold | display |
| `display-lg` | 48 | 56 | SemiBold | display |
| `heading-xl` | 40 | 48 | SemiBold | display |
| `heading-lg` | 32 | 40 | SemiBold | display |
| `heading-md` | 24 | 32 | SemiBold | display |
| `heading-sm` | 20 | 28 | SemiBold | body |
| `heading-xs` | 16 | 24 | SemiBold | body |
| `body-lg` | 18 | 28 | Regular | body |
| `body-md` | 16 | 24 | Regular | body |
| `body-sm` | 14 | 20 | Regular | body |
| `body-xs` | 12 | 16 | Regular | body |
| `label-lg` | 16 | 20 | Medium | body |
| `label-md` | 14 | 20 | Medium | body |
| `label-sm` | 12 | 16 | Medium | body |
| `label-xs` | 11 | 16 | Medium | body |
| `code-md` | 14 | 20 | Regular | mono |
| `code-sm` | 12 | 16 | Regular | mono |
| `overline` | 11 | 16 | SemiBold | body |

Each role owns four tokens — `size`, `line-height`, `tracking`, `weight` — plus the
three shared `font/display`, `font/body`, `font/mono` families. Tracking tightens as
size grows: an optical correction, not decoration. `overline` is the only role that
expects manual uppercasing.

What varies per mode: **tracking** on every role but `code-md` and `code-sm`,
**line-height** on the body roles and `label-lg`, **weight** on the three display
roles and on `heading-xl`, `heading-lg` and `heading-md`, and the **families**.

### 4.7 Elevation

| Style | Shadow | Use |
|---|---|---|
| `Elevation/XS` | 0 1 2 | Inputs at rest, table headers |
| `Elevation/SM` | 0 1 2 + 0 2 4 −1 | Resting cards, chips |
| `Elevation/MD` | 0 4 8 −2 + 0 2 4 −2 | Hovered cards |
| `Elevation/LG` | 0 12 16 −4 + 0 4 6 −2 | Popovers, menus, tooltips |
| `Elevation/XL` | 0 20 24 −4 + 0 8 8 −4 | Dialogs, sheets |
| `Elevation/2XL` | 0 32 64 −12 | Full-screen modals |
| `Focus/Ring` | 0 0 0 +4 ring, 0 0 0 +2 surface gap | Keyboard focus halo |
| `Focus/Ring Danger` | same, in `border/danger` | Focus on a destructive control |
| `Inset/Sunken` | inner 0 1 2 | Pressed wells, code blocks |

The two `Focus/*` styles are spread-only, which makes them conditional on the
host node — see §10 before applying one to a new component.

### 4.8 Motion

Timing and feel are tokens, not per-component values, so every component animates on
the same clock. Like Elevation, motion is mode-invariant — one set of values under
every dial.

| Token | Value | Use |
|---|---|---|
| `duration/base` | 200ms | The default for a UI state change — hover / active fills, a fade-in |
| `duration/spinner` | 1000ms | The spinner's rotation period (a loop, not a transition) |
| `easing/standard` | `cubic-bezier(0, 0, 0.58, 1)` | Every transition — the drawn Ease Out, written explicitly so Figma and CSS carry the identical curve |
| `easing/linear` | `linear` | Continuous / mechanical motion (spinner, progress) where a curve would look broken |

The scale starts deliberately small: **one** transition step. A second (`fast`,
`slow`, `slower`) is added the day a component needs it — a new variable in
`7. Motion`, re-export, re-compile. Nothing restructures, because the compiler
handles motion generically (durations get `ms`, every `duration/*` except
`duration/spinner` is zeroed under reduced motion). Name by role (`base`), never by
number, and reference the token, never the literal.

**What animates, and what must not.** Animate `background-color`, `border-color`,
`color`, `opacity`, `transform`, and `box-shadow` **only** for elevation. Never
animate the **focus ring** — it must appear instantly (WCAG 2.4.7; a fade lags a
keyboard user and smears when focus moves quickly, and focus is a system state, not
an object in motion). Never animate layout-affecting properties (`width`, `height`,
`top`, `left` — use `transform`), and never the flip into disabled. The mechanism is
a rule, not a habit: **never `transition: all`** — enumerate the properties, and keep
the focus-ring `box-shadow` out of every transition list, so it stays instant while
fills animate.

**Reduced motion is handled once, in `tokens.css`.** The compiler emits a
`@media (prefers-reduced-motion: reduce)` block that sets every transition duration
to `0ms`; no component writes its own query. `duration/spinner` is exempt so the
spinner keeps turning — it is the only "busy" affordance, which reduced motion
permits.

---

## 5. Adding a new niche

A niche is 28 aliases in one collection. Nothing else in the system changes.

1. **Pick an accent hue and a neutral.** Accent from the primitive ramps; neutral
   from `gray` (cool), `slate` (corporate blue-grey) or `sand` (warm).
2. **Pick the solid step by contrast.** Compute white on `<hue>/600`. At 4.5:1 or
   better, that is your `accent/solid`. Below it, move one step deeper and measure
   again — bright hues (amber, orange, emerald, cyan, teal) land on 700 where blues,
   indigos and violets land on 600. The label never darkens; the fill moves (§1.8).
3. **Add the mode** to `2. Brand`.
4. **Fill the aliases**: `accent/50…950` → the hue ramp, `neutral/0…1000` → the
   neutral ramp, `accent/contrast`, and the three filled-surface steps
   `accent/solid`, `accent/solid-hover` and `accent/solid-active` → the ramp step
   chosen in step 2 and the two below it.
5. **Add one card to the Brand sweep in Theme Lab.** That sweep is the acceptance
   test for the niche — if the card reads correctly, the niche is done.

Shape and typeface are no longer part of a niche. Pair the brand with a Shape and a
Typography mode instead — see §6.

---

## 6. Dial recipes

The dials are independent, which means a niche is a *combination*, not a switch.
These are the combinations worth starting from.

| Product kind | Brand | Shape | Typography | Density |
|---|---|---|---|---|
| Generic SaaS | Base | Soft | Studio | Default |
| Healthcare / clinical | Healthcare | Rounded | Editorial | Comfortable |
| AI / developer tool | AI | Crisp | Expressive | Default |
| Banking / enterprise | Banking | Sharp | Technical | Compact |
| E-commerce / retail | E-commerce | Soft | Studio | Default |
| Crypto / web3 | Crypto | Crisp | Technical | Compact |
| Education / learning | Education | Rounded | Editorial | Comfortable |
| Wellness / lifestyle | Wellness | Rounded | Expressive | Comfortable |
| Analytics dashboard | any | Crisp | Studio | Compact |
| Marketing site | any | Soft | Expressive | Comfortable |

A recipe is a starting point, not a rule. The value of independent dials is being
able to leave one.

---

## 7. Adding a new component

1. **Check the token layer first.** List every colour, space and size the component
   needs. If one has no semantic token, add the token before drawing anything. A
   component that hardcodes a value is a component that breaks on the next re-skin.
2. **Decide the variant axes.** Only properties that change *appearance rules*.
   Content goes in component properties. Keep the matrix under ~30 unless the
   component genuinely ships a full state grid (Button does; most do not).
3. **Build with auto-layout.** Fixed height from `size/control/*`, horizontal padding
   and gap from `space/*`, radius from `radius/*`, every fill and stroke from a
   semantic token.
4. **Wire the properties.** `TEXT` for labels, `BOOLEAN` for optional parts,
   `INSTANCE_SWAP` for icons. Never a variant per icon.
5. **Write the description.** Purpose, properties, when to use, when not to, what it
   composes with, which tokens it consumes. This is what an agent reads.
6. **Put it in the Theme Lab specimen.** An atom that is not in the specimen is an
   atom the lab does not test. If it cannot go in without special-casing, its API is
   wrong — fix the API, not the specimen.
7. **Verify across dials.** Shape `Sharp` and `Rounded`, Theme `Dark`, Density
   `Compact`, Typography `Editorial`. If any of them breaks it, it is not finished.

---

## 8. Accessibility contract

- Body text meets **4.5:1**; text ≥ 24px or bold ≥ 18.66px meets **3:1**.
- Interactive controls and their focus indicators meet **3:1** against the adjacent
  surface.
- Focus is never removed. `Focus/Ring` plus `border/focus` is the pattern.
- Minimum touch target **44×44** on touch surfaces. `size/control/sm` (32px) is a
  pointer-only size — pad it out on mobile.
- Colour is never the only carrier of meaning. A status badge carries a word; an
  invalid input carries a message.
- Every solid fill carries a white label. If a fill cannot support white at 4.5:1,
  the fill moves one ramp step deeper — the label never darkens.
- Disabled controls are exempt from contrast requirements but are still drawn to be
  recognisable as controls — `text/disabled` sits at neutral/400, not neutral/300.
- **Busy controls borrow the disabled palette but not the disabled semantics.** A
  loading control renders on `bg/disabled` / `text/disabled` so it reads as
  untouchable, and announces itself with `aria-busy="true"`. The spinner is the
  only thing separating *busy* from *unavailable*, so it is never the sole carrier
  of that meaning in code — the accessible name says what is in flight.

---

## 9. Theme Lab

`Theme Lab` is where the system is proved rather than described.

### What it is

Two components, each instanced 21 times. Every instance is identical except for the
modes pinned on it.

| Specimen | Covers |
|---|---|
| `Theme Lab / Specimen` | Avatar, Badge, Input, Switch, Checkbox, Separator, Button |
| `Theme Lab / Specimen B` | Image, Number Input, Color Picker, Textarea, Progress, Label, Slider, Chip, Toggle, Rating, Skeleton |

Together they cover all 20 atoms. Five sweeps, one per dial, each with a row of
Specimen A and a row of Specimen B:

> **Known gap.** The two rows above name 18 atoms; Radio and Spinner are not among
> them. Either they sit inside a specimen without being listed, or the coverage
> claim is stale. Confirming it means reading the specimens' nested instances in
> Figma, which has not been done. Until then, treat "all 20" as unverified.

| Sweep | Cards per row | Holds constant |
|---|---|---|
| Brand | 8 | Light · Default · Soft · Studio |
| Color | 2 | Base · Default · Soft · Studio |
| Shape | 4 | Base · Light · Default · Studio |
| Density | 3 | Base · Light · Soft · Studio |
| Typography | 4 | Base · Light · Default · Soft |

### Why it exists

A token graph can be perfectly correct in the variables panel and still fall apart
on a real surface. Three classes of bug appear only here:

- **Theme-conditional.** A frame with a default white fill is invisible in Light and
  wrecks the card in Dark. Not hypothetical: building this page is what surfaced 74
  such frames across the file, all left behind by `createAutoLayout` defaults.
- **Brand-conditional.** A foreground that passes contrast on indigo and fails on
  emerald. Only a side-by-side sweep makes that obvious.
- **Shape- and density-conditional.** A missed radius binding shows up the instant
  one corner refuses to tighten with the others.

It is also the sales surface. These sweeps are what demonstrate that one kit covers
eight niches, two themes, four shapes and four typographic voices.

### Rules

1. **One component, many instances.** Never duplicate and edit a card.
2. **A sweep changes exactly one dial.** Everything else sits at the baseline. A card
   that differs in two dials tells you nothing about either.
3. **Every instance pins all five modes explicitly**, including the ones it is not
   testing. An unpinned instance inherits the collection default and silently stops
   being a control case.
4. **The specimens between them consume every atom.** Adding an atom means adding
   it to A or B.
5. **Nothing in a card is hardcoded.** A card that needs a value the tokens do not
   have is a finding — add the token, do not paint the card.

### The loop

Change a token or a component → open Theme Lab → read across the rows. The lab
re-renders itself; you never update it. Read across a row rather than down a column:
the eye catches a break in a sweep far faster than in an isolated card.

### Checklist per pass

- **Dark** — no white boxes behind text.
- **Every brand** — the `Save changes` label is white and legible on all eight
  accents. If one looks washed out, `accent/solid` for that niche is a step too
  shallow.
- **Compact** — nothing collides, nothing truncates that should not.
- **Sharp** — card, input and button corners all tighten together. One that does not
  is a missed binding.
- **Editorial** — the card grows taller and nothing overlaps. Leading changes, sizes
  do not.

---

## 10. Effect layer order

Figma paints **later** effects on top of earlier ones. CSS paints **earlier**
`box-shadow` layers on top. `scripts/build-tokens.mjs` reverses the array when it
emits, so the two renderings match.

It matters wherever layers overlap. A focus ring is built as a wide coloured ring
plus a narrower surface-coloured gap that covers the ring's inner half; get the
order wrong and the ring simply covers the gap, leaving a solid band welded to the
control instead of a ring floating outside it.

Two renderer conditions govern whether a ring appears at all, and both are easy
to trip:

- **The node must clip its content.** A spread-only shadow (radius 0) is not
  painted unless `clipsContent` is on. Blurred shadows ignore this, so every
  `Elevation/*` style works everywhere and only the focus rings are exposed. Every
  control carrying `Focus/Ring` has the flag on — Button's `State=Focus` variants,
  and the inner `Field` frame in Input, Textarea, Number Input and Color Picker.
- **The node must have a fill.** A shadow is cast by opaque pixels, so a
  transparent control casts none. Button's Outline and Ghost hierarchies — the two
  with no solid fill — take a `bg/surface` fill in Focus for exactly this reason.
  The fill is invisible in Light, where `bg/surface` and `bg/canvas` are both
  neutral/0, **but visible in Dark on a page background**, where neutral/900 sits on
  a neutral/950 canvas: a focused Outline or Ghost button shows a faintly lighter
  plate. On a card it disappears again. Dropping the fill was measured rather than
  assumed — the ring vanishes with it, whether the effect's *show shadow behind
  transparent areas* flag is on or off, because nothing is left to cast it.

**None of these three cross into CSS — they are Figma-renderer facts, not the
contract.** `box-shadow` paints outside the box with no clip and no fill, so in code
Outline and Ghost stay transparent under `:focus-visible` and nothing clips. The
third case is timing: Button's `Loading` transition is drawn with Smart Animate,
which tweens *everything that changed at once* and cannot separate the fill from the
spinner — so the prototype necessarily animates the palette. The contract keeps the
palette flip **instant** and animates only the spinner's opacity (`duration/base`,
`easing/standard`). Read the prototype for character, never as the literal spec.

---

## 11. Superseded decisions

Decisions that were genuinely made, then replaced. They are recorded rather than
deleted for two reasons: the reasoning that replaced them is part of the system's
argument, and anyone who remembers the old behaviour is owed an explanation instead
of a silent edit.

This is not §10. Section 10 describes Figma-renderer facts that were never part of
the contract. This section describes decisions that *were* the contract and are not
any more.

### Accent fills flipped direction per theme

**What it was.** `bg/accent` resolved to `accent/600` in Light and `accent/500` in
Dark. Hover and active moved one step *darker* in Light and one step *lighter* in
Dark, under the rule that hover always means "more contrast against the page" — the
opposite numeric direction in each theme.

**Why it went.** It contradicts the white-label rule (§1.8). Every solid fill in the
system carries a white label, and white on `accent/500` or anything lighter does not
clear 4.5:1 for the bright hues. The flip therefore produced an inaccessible hover
state in Dark for exactly the niches that needed the deeper step most — orange,
cyan, emerald, teal. Keeping one direction for both themes also removes a rule
consumers had to remember per theme.

**What replaced it.** `bg/accent`, `bg/accent-hover` and `bg/accent-active` alias
`accent/solid`, `accent/solid-hover` and `accent/solid-active`, which are identical
in Light and Dark and step deeper on interaction in both (§4.2, §4.3). The same
holds for the solid status fills, which do not lighten in Dark either.

### Tone as a variable mode instead of a variant axis

**What was considered.** Rather than crossing Button's `Hierarchy` with a `Tone`
axis, put tone in its own variable collection with `Neutral` and `Danger` modes,
bind the component to intermediate `tone/*` tokens, and switch tone by pinning a
mode on the instance. It continues the logic of the five dials one level down, and
it would have cut Button from 126 variants to 72.

**It was prototyped, not argued about.** Eighteen `tone/*` tokens covered all four
hierarchies, including the border asymmetry — `tone/border` and `tone/border-hover`
resolve to `border/default` and `border/strong` in Neutral and both to
`border/danger` in Danger, so the asymmetry lives in the data rather than in the
component. A single focus-ring style with its colour bound to `tone/ring` switched
between indigo and red with the mode, replacing two styles. Nested icons and the
spinner inherited the mode correctly.

**Why it was deferred for Button.**

- **It ships a pair we decided against.** Modes cannot be restricted per variant, so
  a danger Secondary exists whether or not anyone wants it — and it renders
  identically to a danger Ghost under the cursor.
- **Tone leaves the Properties panel.** A designer inspecting a button sees
  `Hierarchy`, `Size` and `State`, and no tone at all; it moves to the mode picker,
  which in this file belongs to the five document-level dials.
- **It leaks through containers.** Pinning `Tone=Danger` on a card turns every
  button inside it red, including ones that should stay neutral. The variant axis
  states a button's tone on the button.
- **The code loses a named prop.** `build-tokens.mjs` maps exactly five collections
  to attributes; a sixth would compile to `[data-tone="danger"]`, so React would
  carry a data attribute instead of a typed variant union, and the token name in Dev
  Mode reads the same in both tones.

**Where it still looks right: Badge.** Six tones × two styles × two sizes is 24
variants for a component whose tone has no hover or press state, no invalid
combination to forbid, and no container-inheritance hazard worth the name — modes
would take it to four. Spinner and Progress are smaller versions of the same
argument. That is a separate piece of work, and it would want its own decision about
whether a component-token layer carries modes at all.
