# The Label rule

Where the `Label` component is used, where it deliberately is not, and why.

---

## The question

Eight things pair a control with a label:

```
Input        → Label + field          Checkbox → Label (beside)
Textarea     → Label + field          Radio    → Label (beside)
Select       → Label + field          Switch   → Label (beside)
Combobox     → Label + field
Date Picker  → Label + field
```

The obvious move is "make all eight nest the Label component". That is the wrong
move, and the reason is worth understanding rather than memorising.

---

## The principle: use a component where there is a joint

A component instance is the right tool where two things are genuinely **separate
elements that a designer composes**. It is the wrong tool where one thing is
**part of another thing's anatomy**.

Look at what the label actually is in each case:

| | Field controls | Selection controls |
|---|---|---|
| Where it sits | Above, same column | Beside, different axis |
| Can the control ship without it? | Almost never — a field with no name is an accessibility failure | Often — a table row selector, a select-all header |
| Who owns its state? | The field. Disabled field ⇒ disabled label, always | Independent; the row owns both |
| Length | One short line | Frequently two lines, sometimes with a description under it |
| Is it clickable? | Yes, but as part of the field | Yes, as an extension of the control's hit area |

Those are two different relationships. The first is anatomy. The second is a joint.

> **Field controls own their label. Selection controls are composed with one.**

---

## What Figma forces

This is not only a taste argument — the tooling settles it.

**A component property cannot bind into a nested instance.** If `Input` nests a
`Label` instance, `Input` can no longer expose a clean `Label` text property: the
text node lives inside the child, and `componentPropertyReferences` only reaches
nodes the component directly owns.

The workaround is `isExposedInstance`, which surfaces the nested component's
properties on the parent. It works — but it surfaces **all** of them, with no way
to hide any:

```
Input
  Size:  MD          ← the field's own variant
  State: Default     ← the field's own variant
  Label
    Text:     "Work email"
    Required: false
    Size:     MD     ← redundant, and now desynchronisable
    State:    Default ← redundant, and now desynchronisable
```

A designer can now set `Input Size=LG` with `Label Size=SM` and the field is
silently wrong. In a kit that gets sold, that is a defect waiting to happen.

So field controls keep an **owned** label node. The field's own `State` variant
drives the label colour, and desync is structurally impossible.

In the selection-control molecules the same exposure is fine, because there the
nested Label *is* the joint — and the caveat is written in the component
description.

---

## What this means in practice

### Field controls — Input, Textarea, Number Input, Color Picker, Select, Combobox, Date Picker

The label is part of the component:

```
Field
  Label            ← owned row, FILL width
    Text           ← the Label text property target
    Required       ← the asterisk, text/danger
  Field            ← the control box
  Helper text      ← doubles as the error message
```

| Property | Default |
|---|---|
| `Label` (text) | the field name |
| `Show label` (bool) | **on** |
| `Required` (bool) | off |

`Show label` defaults **on** so the correct thing is the default thing. Turn it off
only when an adjacent element already names the field.

The label row honours the Label spec below — same text styles, same tokens, same
asterisk — without being a Label instance.

### Selection controls — Checkbox, Radio, Switch

The bare atom ships without a label. The pairing is a molecule:

| Molecule | Layout |
|---|---|
| `Checkbox Field` | control → label column, gap `space/xs`, aligned to the label's **first line** |
| `Radio Field` | same |
| `Switch Field` | label column → control, **space-between**, control at the far edge |

Each nests a real exposed `Label` instance, plus an optional `Description` line the
molecule owns.

`Switch Field` is the one form row where the control comes *after* the label,
because a settings row reads as a statement whose state sits at the end of the line.

---

## The Label spec

Whatever draws a control label — the `Label` atom or a field's own row — honours
this:

| | SM | MD |
|---|---|---|
| Type role | `Label/SM` (12/16) | `Label/MD` (14/20) |
| Colour | `text/primary`, `text/disabled` when the control is disabled | same |
| Required marker | `*`, same type role, `text/danger` (`text/disabled` when disabled) | same |
| Gap to marker | `space/2xs` | same |
| Gap to control (above) | `space/xs` | same |
| Gap to control (beside) | `space/xs` | same |

Only one token differs between the two implementations — the asterisk colour — and
it is named here so it cannot drift unnoticed.

---

## At what stage

Order matters, and getting it wrong is expensive to undo.

| Stage | What happens | Why then |
|---|---|---|
| **1 · Label atom exists** | Built before any field control | A field cannot embed a spec that has not been decided |
| **2 · Field atoms embed their label** | At build time, not retrofitted | The label is anatomy. A field that shipped without one teaches designers it is optional |
| **3 · Selection atoms ship bare** | Checkbox, Radio, Switch carry no label | Keeps them legitimate in table cells and headers |
| **4 · Molecules compose the pairings** | `Checkbox Field`, `Radio Field`, `Switch Field` | A joint only exists once both sides are stable |
| **5 · Later field types inherit the rule** | Select, Combobox, Date Picker | They are molecules, but their label is still *anatomy*, not composition — same as Input |

**The rule is set before the components that need it, not after.** Select, Combobox
and Date Picker do not exist yet; the rule above is what they will be built to. That
is the whole point of settling it now rather than when there are seven field types
to retrofit.

---

## Checklist for any new labelled control

- [ ] Is the value *inside a box*? → field control: own the label, `Show label` on by default, add `Required`
- [ ] Is the value *the control's own state*? → selection control: ship bare, add a `… Field` molecule
- [ ] Does the label sit beside the control? → align the control to the label's **first line**, never to its centre
- [ ] Does it honour the Label spec above — type role, colour, asterisk, gaps?
- [ ] If it nests a Label instance: is it exposed, and does the description warn against overriding the nested `Size` / `State`?
