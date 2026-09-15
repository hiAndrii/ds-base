# Design System Base

A token-driven design system built to mass-produce UI kits and templates.

Five independent dials re-skin everything — colour, light/dark, corner radius,
typeface, density. The component layer never changes.

**Figma file:** [Design System Base](https://www.figma.com/design/U0rO0mELR8c3dvZQQ4Gi9q/)

---

## Why this exists

Producing a sellable UI kit means re-drawing the same 40 components in a new skin
every time. That is the cost this system removes. The atoms are drawn once, bound
entirely to tokens, and every variation is a mode switch rather than a redraw.

| Want | Do this | Time |
|---|---|---|
| Healthcare kit instead of the generic one | Brand → `Healthcare` | seconds |
| Dark version of the whole kit | Theme → `Dark` | seconds |
| Softer, friendlier corners | Shape → `Rounded` | seconds |
| A different typographic voice | Typography → `Editorial` | seconds |
| Dense analytics dashboard | Density → `Compact` | seconds |
| A niche that does not exist yet | Add one Brand mode, fill 25 aliases | ~10 min |

---

## The five dials

| Collection | Modes | Controls |
|---|---|---|
| `2. Brand` | Base · Healthcare · AI · Banking · E-commerce · Crypto · Education · Wellness | Accent hue, neutral temperature, accent contrast |
| `3. Theme` | Light · Dark | Every semantic colour role |
| `4. Space & Size` | Default · Compact · Comfortable | Padding, gaps, control heights |
| `5. Shape` | Soft · Crisp · Sharp · Rounded | Corner radius personality |
| `6. Typography` | Studio · Editorial · Technical · Expressive | Typeface, leading, tracking, weight |

The dials are independent on purpose. A fintech product can take Banking's blue with
Rounded corners; an AI tool can take violet with a Technical typeface. That is
**8 × 4 × 4 × 3 = 384 legitimate combinations** from one set of components.

Recommended starting combinations are in
[docs/DESIGN-SYSTEM.md §6](docs/DESIGN-SYSTEM.md).

---

## Token flow

```
1. Primitives  ──►  Brand · Shape · Typography  ──►  3. Theme  ──►  component
   #4F46E5          accent/600 · radius/md           bg/accent      Button fill
   raw, hidden      the dials                        per-theme      never hardcoded
```

A component never reaches past the semantic layers. If a component needs a value
that no semantic token provides, the fix is a new token — not a hardcoded value.

---

## Documentation

| Doc | For |
|---|---|
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Architecture, principles, full token reference, dial recipes, Theme Lab |
| [docs/ATOMS.md](docs/ATOMS.md) | Every atom's API — properties, states, composition rules, anti-patterns |
| [docs/LABEL-RULE.md](docs/LABEL-RULE.md) | Where the Label component is used, where it is deliberately not, and at what stage |
| [docs/LLM-GUIDE.md](docs/LLM-GUIDE.md) | Rules an AI agent must follow when composing UI from this system |
| [tokens/tokens.json](tokens/tokens.json) | The token graph, machine-readable |

Inside the Figma file: **Start Here** explains the architecture, **Theme Lab** proves
it works.

---

## What ships in v1

- **501 variables** across 6 collections
- **19 text styles**, every property bound to a variable
- **9 effect styles** (elevation + focus), shadow colours theme-aware
- **40 icons** on a 24px grid, 1.5px stroke
- **20 atoms — the complete atomic layer** of the
  [ux-components taxonomy](https://www.ux-components.com/components/atomic):
  Avatar, Badge, Button, Checkbox, Chip, Color Picker, Icon, Image, Input, Label,
  Number Input, Progress, Radio, Rating, Separator, Skeleton, Slider, Spinner,
  Switch, Textarea, Toggle — **319 variants, zero hardcoded values**
- **3 molecules**: Checkbox Field, Radio Field, Switch Field — 52 variants
- **Theme Lab**: two specimen components across five dial sweeps, 42 cards

### Not yet built

The rest of the molecule layer — Card, Alert, Tabs, Select, Combobox, Date Picker,
Tooltip, Dropdown, Toast, Accordion, Pagination, Breadcrumb, List — then organisms.
The atomic layer is complete.
