# Atoms — API reference

Twenty atoms, plus the icon set — the complete atomic layer of the
[ux-components taxonomy](https://www.ux-components.com/components/atomic). Each entry lists the variant axes, the
component properties, the tokens it consumes, and the rules for using it.

Variant axes change appearance. Component properties change content. Anything marked
*(bool)* or *(swap)* or *(text)* is a property, not a variant.

**Where the tokens live.** Colour tokens (`bg/*`, `text/*`, `icon/*`, `border/*`)
come from `3. Theme`. Spacing and sizing (`space/*`, `size/*`, `border-width/*`) come
from `4. Space & Size`. Corner radii (`radius/*`) come from `5. Shape`. Text styles
resolve their typeface from `6. Typography`. Token names below are unqualified
because they are unique across collections.

---

## Icon

40 components, `Icon / <name>`. 24px artboard, 1.5px stroke, round caps and joins,
one child layer named `Vector`.

| | |
|---|---|
| **Sizing** | Resize the instance to a `size/icon/*` token: 12, 16, 20, 24, 32 |
| **Colour** | Override the `Vector` layer's stroke to an `icon/*` token |
| **Swapping** | Every icon shares the `Vector` child name, so a colour override survives an instance swap |

**Set:** check · x · chevron-down · chevron-up · chevron-left · chevron-right ·
arrow-right · arrow-left · plus · minus · search · menu · more-horizontal · user ·
bell · home · calendar · clock · mail · settings · eye · eye-off · lock · trash ·
edit · download · upload · info · alert-circle · alert-triangle · check-circle ·
star · heart · filter · refresh · external-link · copy · link · sparkles · loader

**Do not** draw a new icon at a different stroke weight or on a different grid — it
will read as a foreign object next to the rest.

---

## Button — 90 variants

The primary mechanism for user-initiated actions.

| Axis | Values |
|---|---|
| `Variant` | Primary · Secondary · Outline · Ghost · Destructive |
| `Size` | SM (32) · MD (40) · LG (48) |
| `State` | Default · Hover · Focus · Active · Disabled · Loading |

**Properties:** `Label` (text) · `Show icon left` (bool) · `Icon left` (swap) ·
`Show icon right` (bool) · `Icon right` (swap)

**Anatomy**

```
Button  (hug width, fixed height)
  Spinner      visible only in Loading — structural, not a property
  Icon left    optional, size/icon/*
  Label        2px optical wrapper
    Text       the TEXT property target
  Icon right   optional, size/icon/*
  Focus ring   absolute, visible only in Focus
```

**Loading** — renders on the disabled palette: `bg/disabled` fill,
`text/disabled` label, `icon/disabled` spinner, in every one of the five variants.
A loading button cannot be pressed, so it must not keep advertising that it can;
dropping the accent fill removes the "is this still live?" question instead of
answering it with motion alone. The spinner is what separates *busy* from *not
available* — it is the only difference between this state and Disabled.

The spinner belongs to the variant, not to `Show icon left`.
Component-property defaults do not survive `combineAsVariants`, and switching a
variant on an existing instance keeps the user's overrides; either one on its own
would leave Loading rendering exactly like Default. In Loading the left icon slot
is disconnected from its properties so `Show icon left` cannot place a second
glyph beside the spinner.

In code the control carries `aria-busy="true"` and `disabled` — it is temporarily
inactive, not permanently unavailable, so the label text must stay readable rather
than being replaced by the spinner.

**Focus** — a stroked ring node sitting 4px outside the control, one radius step
larger, in `border/focus` (`border/danger` on Destructive). It is a node rather
than the `Focus/Ring` effect style because a spread-only drop shadow does not
paint on a COMPONENT node; the field atoms can use the style because theirs sits
on an inner `Field` frame. The ring uses STRETCH constraints, so it tracks the
button as the label changes its width.

The label sits in its own 2px auto-layout wrapper. That single wrapper pushes the
text off the button's outer edge by the amount an icon box already carries as
built-in whitespace, and at the same time opens the icon-to-label gap. The icon is
never touched, so the correction survives an icon swap. See DESIGN-SYSTEM §1.6.

**Geometry**

| Size | Height | Padding X | Box gap | Optical | Icon | Text | Radius |
|---|---|---|---|---|---|---|---|
| SM | `size/control/sm` | `space/sm` | `space/2xs` | `space/optical` | `size/icon/sm` | Label/SM | `radius/sm` |
| MD | `size/control/md` | `space/md` | `space/2xs` | `space/optical` | `size/icon/md` | Label/MD | `radius/md` |
| LG | `size/control/lg` | `space/lg` | `space/2xs` | `space/optical` | `size/icon/lg` | Label/LG | `radius/lg` |

The box gap is 4px at every size. Optically it reads as ~8px once the wrapper's 2px
and the icon's own ~2px inset are counted. Do not "fix" it to 8.

**When to use which variant**

- **Primary** — the single most important action on the surface. One per decision group.
- **Secondary** — supporting actions sitting beside a primary.
- **Outline** — standalone actions on a busy or coloured surface where a filled
  button would shout.
- **Ghost** — low-emphasis actions inside toolbars, cards, table rows.
- **Destructive** — irreversible actions. Always behind a confirmation.

**Do not**

- Use a Button for navigation. That is a Link.
- Put two Primary buttons in the same decision group.
- Set an explicit width. The button hugs its label.
- Ship Loading without also disabling the underlying action. The state is drawn
  as non-interactive; the handler must agree with it.
- Add padding to the icon to "balance" it. The correction belongs on the label.

## Input — 18 variants

A labelled single-line text field with helper and error messaging.

| Axis | Values |
|---|---|
| `Size` | SM (32) · MD (40) · LG (48) |
| `State` | Default · Hover · Focus · Filled · Disabled · Error |

**Properties:** `Label` (text) · `Show label` (bool, on) · `Required` (bool) ·
`Value` (text) · `Show icon left` (bool) · `Icon left` (swap) ·
`Show icon right` (bool) · `Icon right` (swap) · `Helper text` (text) ·
`Show helper text` (bool, on for Error)

**Anatomy**

```
Input  (fixed width, hug height, gap space/xs)
  Label        Label/SM or Label/MD, text/primary
  Field        the control row, fixed height
    Icon left  optional
    Value      2px optical wrapper, FILL
      Text     the TEXT property target, ENDING truncation
    Icon right optional
  Helper text  Body/XS or Body/SM, text/secondary or text/danger
```

The label and the message are part of the component, not something you assemble
around it. A field and its label cannot drift apart, and an Error state cannot ship
without somewhere to put the reason.

**Geometry**

| Size | Height | Padding X | Box gap | Value | Label | Helper | Radius |
|---|---|---|---|---|---|---|---|
| SM | `size/control/sm` | `space/sm` | `space/2xs` | Body/SM | Label/SM | Body/XS | `radius/sm` |
| MD | `size/control/md` | `space/sm` | `space/2xs` | Body/MD | Label/MD | Body/SM | `radius/md` |
| LG | `size/control/lg` | `space/md` | `space/2xs` | Body/MD | Label/MD | Body/SM | `radius/lg` |

**State tokens**

| State | Fill | Stroke | Value | Helper text |
|---|---|---|---|---|
| Default | `bg/surface` | `border/default` | `text/placeholder` | `text/secondary` |
| Hover | `bg/surface` | `border/strong` | `text/placeholder` | `text/secondary` |
| Focus | `bg/surface` | `border/focus` + Focus/Ring | `text/primary` | `text/secondary` |
| Filled | `bg/surface` | `border/default` | `text/primary` | `text/secondary` |
| Disabled | `bg/disabled` | `border/disabled` | `text/disabled` | `text/disabled` |
| Error | `bg/surface` | `border/danger` | `text/primary` | `text/danger` |

**Helper text**

One property does both jobs. In every state but Error it explains the expected
format; in Error it becomes the error message and turns `text/danger` automatically.
`Show helper text` defaults on for Error and off elsewhere.

**Do not**

- Turn `Show label` off and lean on the placeholder. It disappears on focus and
  takes the field's meaning with it. Hide the label only when an adjacent element
  already labels the field.
- Show the Error state with `Show helper text` off.
- Use Input for numeric entry with steppers (Number Input), multi-line answers
  (Textarea) or a fixed list (Select).

## Checkbox — 24 variants

Binary toggle, independent of its siblings.

| Axis | Values |
|---|---|
| `Checked` | False · True · Indeterminate |
| `Size` | SM (16) · MD (20) |
| `State` | Default · Hover · Disabled · Error |

**Tokens** — box `size/selection/sm|md`, radius `radius/xs`, unchecked
`bg/surface` + `border/strong`, checked `bg/accent` + `icon/on-accent` mark.

**Rules**

- Zero-or-more selection. Exactly-one is a Radio. Instant-apply is a Switch.
- Indeterminate belongs only on a parent whose children are partly selected. Never
  as a third user-selectable state.
- Ships without a label. Pair with a Label in a horizontal row, gap `space/xs`,
  aligned to the label's **first line** — not centred, or multi-line labels drift.

---

## Radio — 16 variants

One option from a mutually exclusive set.

| Axis | Values |
|---|---|
| `Selected` | False · True |
| `Size` | SM (16) · MD (20) |
| `State` | Default · Hover · Disabled · Error |

**Tokens** — box `size/selection/sm|md`, radius `radius/full`, dot
`size/selection/dot` (8px) filled `bg/surface` on an `bg/accent` box.

**Rules**

- 2–6 visible options. Above that, use a Select.
- A radio group always has one option selected by default.
- Never ship a group of one — that is a Checkbox.
- Stack vertically with gap `space/sm`. Horizontal only for 2–3 short options.

---

## Switch — 12 variants

Instant toggle between two states.

| Axis | Values |
|---|---|
| `Checked` | False · True |
| `Size` | SM (32×20) · MD (40×24) |
| `State` | Default · Hover · Disabled |

**Tokens** — track `size/switch/track-w-*` × `track-h-*`, radius `radius/full`,
padding `space/2xs` (4px, fixed), knob `size/switch/knob-*` filled `bg/surface` with
`Elevation/XS`. Off track `bg/track`, on track `bg/accent`.

**Rules**

- Only for settings that apply immediately. If the change needs a Save, use a Checkbox.
- Never to pick between two labelled options — that is a Toggle Group.
- Label sits to the **left**, pushed apart with space-between. The switch carries no
  label of its own.

---

## Badge — 24 variants

A small indicator for status, count or category.

| Axis | Values |
|---|---|
| `Tone` | Neutral · Accent · Success · Warning · Danger · Info |
| `Style` | Subtle · Solid |
| `Size` | SM (20) · MD (24) |

**Properties:** `Label` (text) · `Show dot` (bool)

**Tone map**

| Tone | Subtle fill / text | Solid fill / text |
|---|---|---|
| Neutral | `bg/neutral` / `text/secondary` | `bg/inverse` / `text/on-inverse` |
| Accent | `bg/accent-subtle` / `text/accent` | `bg/accent` / `text/on-accent` |
| Success | `bg/success-subtle` / `text/success` | `bg/success` (emerald/700) / `text/on-success` |
| Warning | `bg/warning-subtle` / `text/warning` | `bg/warning` (amber/700) / `text/on-warning` |
| Danger | `bg/danger-subtle` / `text/danger` | `bg/danger` / `text/on-solid` |
| Info | `bg/info-subtle` / `text/info` | `bg/info` / `text/on-solid` |

**Anatomy** — `Dot` (optional, `size/selection/dot`) → `Label` (2px optical wrapper)
→ `Text`. Box gap is `space/2xs`; the wrapper balances the label against the dot's
own whitespace the same way it does on Button. See DESIGN-SYSTEM §1.6.

**Rules**

- Subtle inside dense lists and tables — it stays quiet. Solid only when the badge
  must be read before anything around it.
- Interactive or removable? That is a Chip, not a Badge.
- Radius is `radius/xs`, so badges follow the brand shape dial. Override to
  `radius/full` for a pill.
- Every solid carries a white label. Success and Warning sit one ramp step deeper
  than their subtle counterparts so white clears 4.5:1 — the label never darkens.

---

## Avatar — 18 variants

Visual stand-in for a person or entity.

| Axis | Values |
|---|---|
| `Type` | Image · Initials · Icon |
| `Size` | XS 24 · SM 32 · MD 40 · LG 48 · XL 64 · 2XL 96 |

**Properties:** `Image` (slot, Type=Image only) · `Initials` (text) ·
`Show status` (bool)

**Anatomy**

```
Avatar   clipsContent = false  ← the shell does NOT crop
  Media  clipsContent = true, radius/full  ← the round mask
    Image slot | Initials | Icon
  Status absolute, sibling of Media  ← so the mask can never cut it
```

Status is a sibling of the mask, not a child of it. Nest it inside `Media` and the
circular clip slices the dot in half — the failure this structure exists to prevent.

**The image slot**

`Type=Image` exposes a real Figma slot. Drag any photo, frame or illustration into
it and the round mask crops it. Do not detach the instance and do not hunt for a
nested fill — drop content into the slot.

**The fallback ladder** — Image → Initials → Icon, in that order. Image whenever a
picture exists. Initials when only a name exists — two characters, uppercase. Icon
only when neither exists: deleted user, system actor, unauthenticated.

**Status dot**

| Avatar | Dot | Token |
|---|---|---|
| XS 24 · SM 32 | 8 | `size/avatar/status-sm` |
| MD 40 · LG 48 | 12 | `size/avatar/status-md` |
| XL 64 | 16 | `size/avatar/status-lg` |
| 2XL 96 | 24 | `size/avatar/status-xl` |

The dot holds a ~25% ratio to the avatar and its centre lands on the circle at 45°,
not in the bounding-box corner — at 96px the corner is nowhere near the edge. A 2px
`bg/surface` ring separates it from whatever sits underneath. Colour it `bg/success`,
`bg/warning` or `bg/neutral` for online / away / offline.

**Do not** use XS with initials — two characters stop being legible below 24px. Use
the Icon type at that size.

## Separator — 6 variants

Hairline divider.

| Axis | Values |
|---|---|
| `Orientation` | Horizontal · Vertical |
| `Emphasis` | Subtle · Default · Strong |

**Tokens** — fill `border/subtle|default|strong`, thickness `border-width/thin`
(density-invariant).

**Rules**

- FILL on the long axis. Drop it into an auto-layout stack and it spans the
  container. Never set its length by hand.
- Subtle inside dense lists. Default between card sections. Strong only between two
  major page regions.
- Do not place one next to a card border — you get a double line.
- If a heading would group the content better, use the heading.

---

## Spinner — 9 variants

Indeterminate loading indicator.

| Axis | Values |
|---|---|
| `Tone` | Accent · Neutral · On solid |
| `Size` | SM 16 · MD 20 · LG 24 |

**Rules**

- Only when progress cannot be reported. If it can, use Progress.
- Under ~300ms show nothing — a flashing spinner reads as a glitch.
- Over ~3s add text saying what is happening.
- **On solid** is for spinners on a filled button or coloured surface. Neutral
  disappears there.
- Motion spec: rotate 360°, 1s, linear, infinite. The Figma asset is the static spec.

---

## Label — 8 variants

The text that names a form control, for people and for assistive tech.

| Axis | Values |
|---|---|
| `Required` | False · True (appends a `text/danger` asterisk) |
| `Size` | SM (Label/SM) · MD (Label/MD) |
| `State` | Default · Disabled |

**Properties:** `Text` (text)

**Where this component is used** — beside selection controls only, through the
`Checkbox Field`, `Radio Field` and `Switch Field` molecules. Field controls (Input,
Textarea, Number Input, Color Picker, and later Select / Combobox / Date Picker) own
their label rather than nesting this component. The reasoning is in
[LABEL-RULE.md](LABEL-RULE.md) — read it before adding a labelled control.

**Rules**

- Use it standalone above a Slider, or anywhere a control needs a name and has no
  matching `… Field` molecule yet.
- Never stack a Label on a field control; they already have one.
- Do not mark required with colour alone; the asterisk is the signal.

---

## Textarea — 12 variants

Multi-line text input.

| Axis | Values |
|---|---|
| `Size` | MD (96px field) · LG (128px field) |
| `State` | Default · Hover · Focus · Filled · Disabled · Error |

**Properties:** `Label` (text) · `Show label` (bool, on) · `Value` (text) ·
`Helper text` (text) · `Show helper text` (bool, on for Error)

**Anatomy** — Label → Field → Helper text, exactly like Input. The field is
top-aligned and FIXED height; the value sits in a 2px optical wrapper.

**Rules**

- One line or less is an Input. Longer is a Textarea.
- Height is fixed on purpose: an auto-growing textarea shifts everything below it
  while the user types. Pick MD (~4 lines) or LG (~6) and let it scroll.

---

## Number Input — 15 variants

Numeric field with increment and decrement.

| Axis | Values |
|---|---|
| `Size` | SM (32) · MD (40) · LG (48) |
| `State` | Default · Hover · Focus · Disabled · Error |

**Properties:** `Label` (text) · `Show label` (bool, on) · `Value` (text) ·
`Helper text` (text) · `Show helper text` (bool, on for Error)

**Anatomy** — the field holds the value on the left and a 32px stepper column on
the right, divided by a single left border rather than two separate buttons so the
control height stays exact. Steppers are `chevron-up` / `chevron-down` at
`size/icon/xs`.

**Rules**

- Small bounded quantities the user nudges — quantity, guests, copies, a limit.
  Large or open-ended numbers: drop the steppers, use a plain Input.
- Approximate values: use a Slider.
- Never for years, phone numbers, PINs or card numbers — those are strings that
  happen to be digits, and steppers make no sense on them.
- State the allowed range in the helper text.

---

## Color Picker — 8 variants

The trigger that opens a colour selection surface.

| Axis | Values |
|---|---|
| `Size` | SM (32) · MD (40) |
| `State` | Default · Hover · Focus · Disabled |

**Properties:** `Label` (text) · `Show label` (bool, on) · `Value` (text, the hex)

**Scope** — trigger only: swatch, hex, disclosure chevron. The spectrum, eyedropper
and saved swatches belong to a Popover molecule that opens from it.

**The Swatch layer is the one place in the system where overriding a fill with a
literal colour is correct** — the colour *is* the value. Everything else stays on
tokens.

**Rules** — value in `Code/SM`/`Code/MD` so hex digits align; uppercase, with the
hash. Never rely on the swatch alone; the hex is what makes the value copyable and
readable to someone who cannot distinguish the colour.

---

## Toggle — 12 variants

A button that holds an on/off state and shows which it is in.

| Axis | Values |
|---|---|
| `Selected` | False · True |
| `Size` | SM (32) · MD (40) |
| `State` | Default · Hover · Disabled |

**Properties:** `Label` (text) · `Show icon` (bool) · `Icon` (swap)

**Toggle vs Switch vs Checkbox** — Toggle is an *action-like* binary (bold, a map
layer, a view filter). Switch is a *setting* that applies immediately. Checkbox is a
*form field* that gets submitted.

**Selected** is a tinted fill **plus** an accent border **plus** accent text — three
signals, because a border alone is too quiet to read as "on" at a glance.

The label carries `space/optical`, same as Button.

---

## Chip — 8 variants

A compact, interactive element representing an input, attribute or filter.

| Axis | Values |
|---|---|
| `Style` | Outline · Filled |
| `Selected` | False · True |
| `Size` | SM (24) · MD (32) |

**Properties:** `Label` (text) · `Show icon` (bool) · `Icon` (swap) ·
`Show remove` (bool)

**Chip vs Badge** — a Chip is interactive: selectable, removable, or both. A Badge
is a read-only status marker. If it cannot be clicked, it is a Badge.

**Shape** — Chip keeps `radius/full` in every Shape mode. The pill is what makes it
read as a chip, so it deliberately opts out of the Shape dial.

**Rules** — Outline for filters and choices in a toolbar; Filled for applied filters
and for tokens inside an input. Turn on `Show remove` only when removal is actually
available. Keep labels to ~3 words; truncation on a pill reads badly.

---

## Slider — 6 variants

Pick a numeric value by dragging a knob along a track.

| Axis | Values |
|---|---|
| `Size` | SM (4px track, 16px knob) · MD (8px track, 20px knob) |
| `State` | Default · Hover · Disabled |

**Setting the value** — drag the Knob and resize Bar to the same x. The knob's
position *is* the value; nothing keeps Bar and Knob in sync for you. Track uses
STRETCH constraints, so resizing the slider is safe.

**Rules** — approximate values where the exact number does not matter much. Fewer
than ~10 steps: use Radio or a Toggle group. Never ship a Slider without showing its
current value somewhere; pair it with a Number Input when the exact number matters.

---

## Progress — 8 variants

A determinate indicator of how far along a task is.

| Axis | Values |
|---|---|
| `Tone` | Accent · Success · Warning · Danger |
| `Size` | SM (4px track) · MD (8px track) |

**Properties:** `Label` (text) · `Value` (text) · `Show label` (bool, on)

**Setting the value** — resize the Bar layer inside Track. There is no percentage
token; the bar's width *is* the value. Keep the Value text in sync manually.

**Rules** — only when completion can actually be measured; otherwise Spinner. Tone
carries meaning: Accent for neutral progress, Success for a met goal, Warning
approaching a limit, Danger over it. Do not hide the Value on a long task — a bar
with no number reads stalled.

---

## Rating — 12 variants

A five-star score, interactive or read-only.

| Axis | Values |
|---|---|
| `Value` | 0 · 1 · 2 · 3 · 4 · 5 |
| `Size` | SM (16px stars) · MD (24px stars) |

Filled stars paint the same outline glyph with `icon/warning` on both fill and
stroke — there is no second asset. Empty stars are `icon/tertiary` stroke only.

**Rules** — no half stars; show the number beside a rounded-down Value instead.
Always pair an aggregate with its count — "4.2 (318)". The stars are decoration: the
score must also exist as text for screen readers.

---

## Skeleton — 9 variants

A placeholder that holds the shape of content while it loads.

| Axis | Values |
|---|---|
| `Shape` | Line (text) · Block (media, cards) · Circle (avatars) |
| `Size` | SM · MD · LG |

Line heights match the line-height of the body role they stand in for — 12 / 16 / 20.

**Rules** — use when the layout of the incoming content is known; otherwise Spinner.
A skeleton that is the wrong size causes a layout jump on load, which is worse than
a spinner. Do not animate faster than ~1.5s per cycle.

---

## Image — 4 variants

A ratio-locked media frame with a content slot.

| Axis | Values |
|---|---|
| `Ratio` | 1:1 · 4:3 · 16:9 · 2:1 |

**Properties:** `Image` (slot) · `Caption` (text) · `Show caption` (bool)

**The slot** — drag any photo, frame or illustration in; Media crops it to the ratio.
Do not detach, do not replace the component's own fill.

Every ratio resolves to a 4pt-grid height at the default 320px width —
320 / 240 / 180 / 160.

**Rules** — for a person or entity use Avatar instead (round mask, initials
fallback). The caption is for credits and licences, not a restatement of the image —
and it is **not** alt text; record that separately in handoff.

---

## Composition quick reference

| Pattern | Recipe |
|---|---|
| Form field | Use Input as-is — it already contains Label and Message |
| Checkbox row | Checkbox → Label, horizontal, gap `space/xs`, top-aligned |
| Settings row | Label + description → Switch, horizontal, space-between |
| Button pair | Secondary → Primary, horizontal, gap `space/sm`, primary last |
| User cell | Avatar → (name / role stack), horizontal, gap `space/sm` |
| Status cell | Badge alone, or Badge → text, gap `space/xs` |
| List separation | Separator (Subtle) between rows, never around the first or last |
| Filter bar | Chip row, horizontal, gap `space/xs`, applied ones Filled+Selected |
| View switcher | Toggle group, horizontal, gap `space/2xs`, one Selected |
| Loading list row | Skeleton Circle + two Skeleton Lines in a column, gap `space/2xs` |
| Media card | Image (16:9) → title → body, vertical, gap `space/sm` |
| Quota meter | Progress with Tone matching the state — Accent, then Warning, then Danger |
