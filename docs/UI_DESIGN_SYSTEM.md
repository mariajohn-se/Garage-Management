# Design System — GARAGE MANAGEMENT -DB PRESERVE


*Generated: 2026-06-16*


---

## Brand Assets

**Primary Brand Color:** `#3831c4` — this is FIXED. Use it for `color-primary` exactly as given and derive all secondary, accent, and neutral colors to complement it.

---

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `color-primary` | `#3831c4` | Primary brand, buttons, icons, accents |
| `color-primary-dark` | `#2a2597` | Hover/active state for primary elements |
| `color-primary-light` | `#6c65ea` | Subtle highlights, progress gradients |
| `color-primary-surface` | `#f5f6ffb3` | Icon backgrounds, light accent areas |
| `color-primary-border` | `#cfd2fc` | Card borders, dividers on light surfaces |
| `color-bg-page` | `#e8eafc` | App/page background |
| `color-bg-card` | `#ffffffcc` | Card/panel background |
| `color-bg-dark-card` | `#1c1b38cc` | Dark card variant |
| `color-text-primary` | `#232233` | Primary readable text |
| `color-text-secondary` | `#595987` | Labels, metadata, muted text |
| `color-text-muted` | `#959ac7` | Notes, hints, disabled-adjacent text |
| `color-success` | `#2eae6c` | Completed states, positive feedback |
| `color-warning` | `#f7be43` | Caution, pending states |
| `color-error` | `#d23b41` | Errors, validation failures |
| `color-info` | `#368aad` | Informational messages |
| `color-border` | `#ebecf5` | Input borders, dividers |
| `color-border-strong` | `#d3d6ee` | Strong dividers, focused borders |

---

## CSS Custom Properties

Declare this block in `index.css` or `tokens.css`. Every color value must match the Color Palette table above.

```css
:root {
  /* Brand */
  --color-primary:         #3831c4;
  --color-primary-dark:    #2a2597;
  --color-primary-light:   #6c65ea;
  --color-primary-surface: #f5f6ffb3;
  --color-primary-border:  #cfd2fc;

  /* Backgrounds */
  --color-bg-page:      #e8eafc;
  --color-bg-card:      #ffffffcc;
  --color-bg-dark-card: #1c1b38cc;

  /* Text */
  --color-text-primary:   #232233;
  --color-text-secondary: #595987;
  --color-text-muted:     #959ac7;

  /* Semantic */
  --color-success: #2eae6c;
  --color-warning: #f7be43;
  --color-error:   #d23b41;
  --color-info:    #368aad;

  /* Borders */
  --color-border:        #ebecf5;
  --color-border-strong: #d3d6ee;

  /* Typography */
  --text-h1-size: 28px;      --text-h1-weight: 700;  --text-h1-line-height: 1.2;
  --text-h2-size: 22px;      --text-h2-weight: 600;  --text-h2-line-height: 1.3;
  --text-h3-size: 18px;      --text-h3-weight: 600;  --text-h3-line-height: 1.4;
  --text-h4-size: 15px;      --text-h4-weight: 600;  --text-h4-line-height: 1.4;
  --text-body-lg-size: 15px; --text-body-lg-weight: 400; --text-body-lg-line-height: 1.6;
  --text-body-size: 13px;    --text-body-weight: 400;    --text-body-line-height: 1.6;
  --text-sm-size: 12px;      --text-sm-weight: 400;      --text-sm-line-height: 1.5;
  --text-xs-size: 11px;      --text-xs-weight: 500;      --text-xs-line-height: 1.4;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;

  /* Border Radius */
  --radius-sm:   12px;
  --radius-md:   16px;
  --radius-lg:   20px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:    0 2px 8px 0 rgba(56,49,196,0.08);
  --shadow-md:    0 4px 16px 0 rgba(56,49,196,0.10);
  --shadow-lg:    0 8px 32px 0 rgba(56,49,196,0.13);
  --shadow-focus: 0 0 0 3px #3831c433;
}
```

---

## 1. Typography

### Font Stack
```
Primary:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace:  'Fira Code', 'Cascadia Code', Consolas, monospace
```

### Type Scale

| Token | Size | Weight | Line Height | CSS Variables | Usage |
|---|---|---|---|---|---|
| `text-h1` | 28px | 700 | 1.2 | `--text-h1-size` `--text-h1-weight` `--text-h1-line-height` | Page/modal titles |
| `text-h2` | 22px | 600 | 1.3 | `--text-h2-size` `--text-h2-weight` `--text-h2-line-height` | Section headings |
| `text-h3` | 18px | 600 | 1.4 | `--text-h3-size` `--text-h3-weight` `--text-h3-line-height` | Subsection headings |
| `text-h4` | 15px | 600 | 1.4 | `--text-h4-size` `--text-h4-weight` `--text-h4-line-height` | Card titles, form labels |
| `text-body-lg` | 15px | 400 | 1.6 | `--text-body-lg-size` `--text-body-lg-weight` `--text-body-lg-line-height` | Prominent body text |
| `text-body` | 13px | 400 | 1.6 | `--text-body-size` `--text-body-weight` `--text-body-line-height` | Standard body text, inputs |
| `text-sm` | 12px | 400 | 1.5 | `--text-sm-size` `--text-sm-weight` `--text-sm-line-height` | Secondary text, captions |
| `text-xs` | 11px | 500 | 1.4 | `--text-xs-size` `--text-xs-weight` `--text-xs-line-height` | Labels, badges, table headers |

---

## 2. Spacing

Base unit: **8px**. All spacing is a multiple of 4px.

| Token | Value | CSS Variable | Common Use |
|---|---|---|---|
| `space-1` | 4px | `--space-1` | Tight inline gaps |
| `space-2` | 8px | `--space-2` | Gap between related items |
| `space-3` | 12px | `--space-3` | Inner padding for compact elements |
| `space-4` | 16px | `--space-4` | Standard padding, row gaps |
| `space-5` | 20px | `--space-5` | Between form groups |
| `space-6` | 24px | `--space-6` | Between major UI sections |
| `space-8` | 32px | `--space-8` | Large section separation |
| `space-10` | 40px | `--space-10` | Page-level horizontal padding |
| `space-12` | 48px | `--space-12` | Hero/feature sections |

---

## 3. Border Radius

| Token | Value | CSS Variable | Usage |
|---|---|---|---|
| `radius-sm` | 12px | `--radius-sm` | Inputs, small chips, tooltips |
| `radius-md` | 16px | `--radius-md` | Cards, panels, dropdowns |
| `radius-lg` | 20px | `--radius-lg` | Modals, drawer panels |
| `radius-xl` | 24px | `--radius-xl` | Feature cards, onboarding banners |
| `radius-full` | 9999px | `--radius-full` | Badges, tags, avatar circles |

---

## 4. Elevation / Shadows

| Token | CSS Variable | Usage |
|---|---|---|
| `shadow-sm` | `var(--shadow-sm)` | Subtle card lift |
| `shadow-md` | `var(--shadow-md)` | Dropdowns, popovers |
| `shadow-lg` | `var(--shadow-lg)` | Modals, drawers |
| `shadow-focus` | `var(--shadow-focus)` | Keyboard focus ring |

---

## 5. Grid & Layout

- **Max content width:** 1280px, horizontally centered
- **Sidebar width:** 240px fixed (when used)
- **Content padding:** `var(--space-6)` horizontal · `var(--space-5)` vertical
- **Column grid:** 12 columns · 16px gutters
- **Breakpoints:**

| Name | Min Width | Columns |
|---|---|---|
| Mobile | — | 4 |
| Tablet | 768px | 8 |
| Desktop | 1024px | 12 |

---

## 6. Component Specifications

### Buttons

| Variant | Background | Text | Border | When to Use |
|---|---|---|---|---|
| Primary | `var(--color-primary)` | White | — | Main CTA, submit actions |
| Secondary | Transparent | `var(--color-text-primary)` | `var(--color-border)` | Supporting actions |
| Danger | `var(--color-error)` | White | — | Delete, destructive actions |
| Ghost | Transparent | `var(--color-primary)` | — | Tertiary, inline actions |

**Sizes:**

| Size | Font | Padding | Min Height |
|---|---|---|---|
| Large | `var(--text-body-lg-size)` | `var(--space-3)` `var(--space-6)` | 40px |
| Default | `var(--text-body-size)` | `var(--space-2)` 18px | 34px |
| Small | `var(--text-sm-size)` | 6px `var(--space-3)` | 28px |

**States:** Default → Hover (10% darker bg) → Active (20% darker) → Disabled (45% opacity, `cursor: not-allowed`) → Loading (spinner, `pointer-events: none`)

---

### Form Inputs (text, select, textarea)

- Background: `var(--color-bg-card)`
- Border: `1px solid var(--color-border)`
- Focus: border `var(--color-primary)` + `var(--shadow-focus)`
- Error: border `var(--color-error)`
- Height (single line): 34px
- Padding: `var(--space-2)` `var(--space-3)`
- Font size: `var(--text-body-size)` / weight: `var(--text-body-weight)`
- Placeholder: `var(--color-text-muted)`

---

### Cards & Panels

- Background: `var(--color-bg-card)`
- Border: `1px solid var(--color-border)`
- Radius: `var(--radius-md)`
- Padding: `var(--space-4)` – `var(--space-6)`
- Shadow: `var(--shadow-sm)`

---

### Data Tables

- Header background: slightly darker than `var(--color-bg-card)`, font `var(--text-xs-size)` uppercase
- Row hover: 4% opacity overlay of `var(--color-primary)`
- Row height: 40px (default) / 52px (with secondary text)
- Cell padding: `var(--space-2)` `var(--space-3)`
- Divider: `1px solid var(--color-border)`

---

### Badges & Status Pills

- Font: `var(--text-xs-size)`, uppercase, 600 weight
- Padding: 2px `var(--space-2)`
- Radius: `var(--radius-full)`

| Variant | Background | Text |
|---|---|---|
| Success | `var(--color-success)` at 10% opacity | `var(--color-success)` |
| Warning | `var(--color-warning)` at 10% opacity | `var(--color-warning)` |
| Error | `var(--color-error)` at 10% opacity | `var(--color-error)` |
| Info | `var(--color-info)` at 10% opacity | `var(--color-info)` |
| Neutral | `var(--color-bg-dark-card)` | `var(--color-text-secondary)` |

---

### Alerts & Banners

- Padding: `var(--space-3)` `var(--space-4)`
- Font: `var(--text-sm-size)`
- Left accent border: `3px solid` role color
- Background: role color at 8% opacity

---

## 7. Interaction States

| State | Visual Treatment |
|---|---|
| Hover | 5–10% background darkening or border color change |
| Focus | `var(--shadow-focus)` ring around element |
| Active | 15–20% darkening |
| Disabled | 45% opacity, `cursor: not-allowed` |
| Loading | Spinner overlay or skeleton, `pointer-events: none` |
| Validation Error | `var(--color-error)` border + error text below field |

---

## 8. Icons

Recommended library: **Lucide** (or equivalent outline-style set).

| Context | Size |
|---|---|
| Inline with body text | 14×14px |
| Button / input adornment | 16×16px |
| Navigation / section icon | 20×20px |
| Feature / card icon | 24×24px |

---

## 9. Motion

- **Duration:** Micro 100ms · Standard 200ms · Enter/Exit 300ms
- **Easing:** `ease-out` (enter) · `ease-in` (exit) · `ease-in-out` (state changes)
- Animate `opacity` and `transform` only — avoid triggering layout

---

---

## UX Design Guidelines

### glassmorphism

## Glassmorphism

## Identity

Glassmorphism creates the illusion of frosted glass panels floating over a vivid background. Depth comes from translucency, blur, and layered surfaces rather than shadows or borders. The background is always visible — muted, softened, but present — giving the interface a sense of physical space and atmosphere.

**Feels like:** Ethereal, layered, airy, modern, immersive, polished.
**Does not feel like:** Flat, heavy, opaque, cluttered, retro, paper-like.

---

## Color Rules

### Palette generation
- The **background** is the hero — it must be visually rich (gradients, imagery, or bold color fields) because it bleeds through every glass surface.
- Derive a **vibrant gradient** from the primary color: shift hue 30–60° for the second stop. The gradient should feel luminous, not muddy.
- Glass surfaces use the **background color at low opacity** (10–25%) with a white or light overlay to simulate refraction.
- The accent color should contrast clearly against both the glass surface and the background — it needs to read through the blur.
- Neutral text sits on glass surfaces, so it must have sufficient contrast against a **variable, semi-transparent backdrop**. Test contrast against the lightest and darkest regions the glass could overlay.

### Constraints
- Background must have enough color variation and richness for the blur to produce a visible frosted effect. A flat gray background makes glass invisible — the style collapses.
- Glass surfaces must remain **readable**. If translucency compromises legibility, increase the white/dark overlay opacity — readability overrides aesthetic.
- Dark mode glass uses dark-tinted overlays (dark color at 15–30% opacity) instead of white. The blur still reveals background color beneath.
- Limit glass layers to **2–3 depth levels**. Stacking too many translucent layers creates visual mud — each successive layer compounds blur and reduces the effect.

### Anti-patterns
- Flat or solid-color backgrounds that give the blur nothing to work with.
- Glass surfaces that are too transparent — text becomes unreadable.
- Glass surfaces that are too opaque — the effect is lost, it just looks like a solid card with rounded corners.
- Using glassmorphism on every element — reserve it for primary containers. Supporting UI (tooltips, small controls) can be solid.
- Heavy dark shadows behind glass — this fights the light, airy quality. Use subtle, diffused shadows only.

---

## The Glass Effect

### Surface recipe
Every glass surface is built from the same layered recipe, tuned per depth level:

1. **Background fill**: white (light mode) or dark neutral (dark mode) at 10–25% opacity.
2. **Backdrop blur**: 10–40px. Higher blur = more frosted/opaque feel. Lower blur = more transparency, more background detail visible.
3. **Border**: 1px solid white at 15–30% opacity on the top and left edges to simulate light refraction (the "edge highlight").
4. **Subtle shadow**: soft, diffused, low opacity — just enough to lift the surface off the background.

### Depth levels
- **Level 1** (furthest back): lowest opacity, highest blur, largest surface — the main container or page frame.
- **Level 2** (mid): slightly more opaque, moderate blur — cards, panels, dialogs.
- **Level 3** (nearest): most opaque, lower blur — dropdowns, popovers, tooltips. These need the most readability.

### Constraints
- Each level should be visually distinguishable from the one behind it. If two glass layers look identical, merge them.
- The edge highlight border is directional — typically top and left only, simulating a single overhead light source. All-around borders flatten the effect.
- Blur values below 8px look like a rendering error, not a design choice. Minimum 10px.

---

## Typography Rules

### Selection
- Maximum **2 font families**. Clean sans-serifs work best — the glass surfaces are visually complex, so type should be simple and legible.
- Prefer medium to semi-bold weights (500–600) for body text on glass — thin weights disappear against variable translucent backgrounds.
- Load no more than **3 weights**.

### Scale
- Use a modular scale with a ratio between 1.2 and 1.333. Base size: 16px.
- Define 5–7 size tokens: display, h1, h2, h3, body, small, caption.

### Readability on glass
- **This is the critical challenge of glassmorphism.** Text sits on semi-transparent surfaces over unpredictable backgrounds.
- Primary text should be near-white (light text on dark glass) or near-black (dark text on light glass) — avoid mid-tone text.
- Add a **text shadow** (very subtle, 0 1px 2px at low opacity) to lift text off the glass if contrast is marginal.
- If a glass surface overlays a high-contrast or busy background region, increase the surface opacity locally or add a subtle solid backing behind the text block.
- Test contrast with the glass surface over the **worst-case background area** — the darkest or most saturated region.

### Anti-patterns
- Light gray text on light glass — disappears over bright background areas.
- Relying on blur alone for readability — blur softens the background but doesn't guarantee contrast.
- Thin font weights (100–300) on glass surfaces.

---

## Spacing and Layout Rules

### Spacing
- All spacing on a **4px base grid** (4, 8, 12, 16, 24, 32, 48, 64).
- **Generous internal padding** on glass surfaces — content must not touch the frosted edges. Minimum 16px padding on cards, 24–32px on larger panels.
- Space between glass surfaces should be enough to reveal the background between them — the negative space between panels is part of the effect.

### Layout
- The background (gradient, image, or color field) is a **full-bleed layer** behind everything. It should extend to viewport edges.
- Glass surfaces **float** over the background — they should not tile edge-to-edge or fill the viewport completely. Visible background between and around glass panels is essential.
- Overlapping glass panels are acceptable and reinforce the layered depth, but limit to 2 overlapping layers.
- Center-aligned and card-based layouts work well. Avoid dense grid layouts that leave no background visible.

### Anti-patterns
- Glass surfaces touching or tiling with no gaps — kills the floating illusion.
- Glass surfaces filling the entire viewport — there's no background to see through, so the effect is pointless.
- Dense, information-heavy layouts — glassmorphism is not suited for data tables or complex dashboards. It trades density for atmosphere.

---

## Depth and Borders

- **Borders simulate light refraction**, not containment. Use a 1px semi-transparent white (or light-colored) border, stronger on top/left edges.
- Border radius: **12–24px**. Glass panels should feel soft and rounded. Sharp corners fight the smooth, liquid aesthetic.
- Shadows: **soft and diffused**, low opacity. The shadow's purpose is to separate the glass layer from the background, not to create dramatic depth.
- No hard shadows, no drop shadows with tight spread. Think "ambient occlusion" not "drop shadow."
- Inner glow (inset box-shadow with white at very low opacity) can enhance the glass feel on the top edge.

---

## Iconography

- Outline/line style — filled icons are too heavy against translucent surfaces.
- Icon color matches text color. On glass, icons may need the same subtle text-shadow treatment for legibility.
- Keep icon count low per glass surface — visual simplicity matters more here because the background is already adding complexity.

---

## Motion

- **Glass surfaces should feel physical** — they enter by fading in + slight upward drift (translateY), not by snapping.
- Transitions: 250–400ms with ease-out. Slightly slower than minimalist UI — the layered depth benefits from visible motion.
- Background gradients can animate slowly (color shift, gentle drift) to add life — but keep it subtle and slow (10s+ cycle).
- Blur can animate on hover (e.g., increasing blur slightly on a hovered card) but this is GPU-intensive — use sparingly.
- Respect `prefers-reduced-motion`.

---

## Component Behavior

### Buttons
- Primary button: filled with accent color, **not glass**. It must be the most solid, assertive element to stand out against translucent surroundings.
- Secondary/ghost buttons: semi-transparent background with a light border, matching the glass surface recipe at higher opacity.
- Hover state: increase background opacity slightly and/or add a subtle glow.

### Cards
- Glass surfaces with the standard recipe. Each card is an independent glass panel.
- Cards should have enough internal padding and clear typographic hierarchy since the background adds visual noise.

### Forms
- Input fields: semi-transparent background (glass-like), subtle border. Focus state uses accent color border.
- Labels above inputs — placeholder-only labels are even more problematic on glass because the variable background makes faint placeholder text hard to see.
- Error/success states need **opaque or near-opaque backgrounds** for their messages — do not put critical information on a glass surface where it might be lost.

### Navigation
- Navigation bar as a glass surface pinned to the top — the classic glassmorphism pattern.
- Active state: accent color indicator or a slightly brighter glass background.
- Ensure nav text remains readable as page content scrolls beneath the frosted bar.

### Modals and dialogs
- Glass surface at the highest depth level (most opaque).
- The backdrop overlay behind the modal should dim the background, increasing the modal's contrast and readability.

---

## Decision Heuristics

| When uncertain about... | Default to... |
|---|---|
| Glass surface opacity | More opaque — readability wins over aesthetics. |
| Blur amount | 16–20px as a safe middle ground. |
| Background richness | More color, more gradient — the effect needs something to show through. |
| Number of glass layers | Fewer. 2 depth levels covers most layouts. |
| Text contrast on glass | Test against the worst-case background region, not the average. |
| Whether an element should be glass | Only primary containers. Small UI elements stay solid. |
| Border radius | 16px as a safe default. |
| Animation speed | Slightly slower than you'd use in flat UI — the depth deserves time to register. |
| Glass vs. solid for critical info | Solid. Errors, alerts, and essential actions should never rely on translucency. |


### minimalism

## Minimalism

## Identity

Minimalism is the discipline of reduction — every element must earn its place. The interface recedes so content and user tasks dominate. Clarity comes from subtraction, not addition. Whitespace is structural, not empty. Typography does the heavy lifting for hierarchy, not color or decoration.

**Feels like:** Calm, confident, premium, focused, quiet authority.
**Does not feel like:** Sterile, incomplete, lazy, cold, empty.

---

## Color Rules

### Palette generation
- Derive a **monochromatic neutral ramp** (4–8 shades) from the primary color's hue, heavily desaturated (0–5% saturation).
- The **accent color** is the primary color itself, used sparingly — primary buttons, active states, links, focus rings.
- Only **one accent hue**. Derive hover/active/disabled variants by shifting lightness, never introducing new hues.
- Semantic colors (error, success, warning) should be desaturated to match the palette's quiet tone. They are the only exception to the single-hue rule.

### Constraints
- Avoid pure white and pure black — shift slightly toward the primary color's hue for warmth and cohesion.
- Text-to-background contrast: minimum 7:1 for primary text, 4.5:1 for secondary text.
- The accent color should be the **loudest element** in any view. If something else is louder, the palette is wrong.
- Dark mode: do not invert. Rebuild the neutral ramp for dark backgrounds — reduce text brightness slightly, increase surface-level distinction with subtle lightness steps.

### Anti-patterns
- Multiple accent hues competing for attention.
- Neon or fully saturated accents next to muted neutrals.
- Grays that inconsistently shift warm/cool across the ramp.
- Using opacity for text color instead of defined tokens.

---

## Typography Rules

### Selection
- Maximum **2 font families** — one for headings, one for body/UI. A single family for both is also valid.
- Prefer geometric sans-serifs or neo-grotesques for body. A contrasting serif or mono is acceptable for display headings only.
- Load no more than **3 weights** (e.g., 400, 500, 700).

### Scale
- Use a **modular scale** with a ratio between 1.2 (compact UI) and 1.333 (editorial). Base size: 16px.
- Define 5–7 size tokens: display, h1, h2, h3, body, small, caption.
- Enforce **max line width of 65 characters** for body text.

### Hierarchy
- Hierarchy comes from size + weight + color together — never size alone.
- Headings: tight line-height (1.1–1.2), negative letter-spacing.
- Body: relaxed line-height (1.5–1.7), default letter-spacing.
- Minimum 200-unit weight difference between heading and body (e.g., body 400, heading 600).
- Uppercase is reserved for short overline labels only (1–3 words, wide letter-spacing).

### Anti-patterns
- Centered body text (center only short hero text or headings).
- Thin weights (100–200) for body or UI text.
- All-caps for anything longer than a label.
- More than 2 font families.

---

## Spacing and Layout Rules

### Spacing
- All spacing values on a **4px base grid** (4, 8, 12, 16, 24, 32, 48, 64, 96).
- When uncertain, add more space — minimalism requires generous whitespace.
- Group related elements tightly, separate unrelated groups widely (Gestalt proximity).
- Vary spacing to create hierarchy — do not use equal spacing everywhere.

### Layout
- Prefer **single-column layouts** for reading content. Multi-column only for dashboards, tools, or comparison views.
- Enforce a maximum content width (around 1200px). Let surrounding whitespace grow on large screens.
- Rigorous alignment — every element on an implied grid. Misalignment is magnified when the layout is sparse.
- Flat visual hierarchy — avoid deep nesting of containers.

### Anti-patterns
- Cramped layouts with few elements but no breathing room.
- Content touching container edges without padding.
- Inconsistent alignment or gutters — even 1–2px off is visible.

---

## Depth and Borders

- **Prefer separation through spacing and subtle background shifts** over borders and shadows.
- Borders: 1px, solid, muted. Structural only — never decorative.
- Border radius: small to medium (4–12px). Pill shapes for buttons are acceptable. Large radii (16px+) feel playful, not minimal.
- Shadows: soft and diffused, reserved for **floating elements** (dropdowns, modals, popovers). Not for static cards unless needed.
- No colored shadows, no hard/sharp shadows, no shadow on every element.

---

## Iconography

- Outline/line style, consistent stroke weight across all icons.
- Icons follow the text color at their hierarchy level — never louder than their label.
- Every interactive icon needs a text label unless universally understood (close, search, menu, back).
- Filled/solid icons are too heavy for minimal UIs — avoid.

---

## Motion

- Transitions: short durations (150–300ms), ease-out for entrances, ease-in for exits.
- Animate only **opacity and transform** (no layout-triggering properties).
- Use motion for state changes and micro-interactions. Do not animate critical content the user needs immediately.
- Staggered entrance animations for lists are acceptable but keep them subtle and fast.
- Respect `prefers-reduced-motion` — disable non-essential animation.

---

## Component Behavior

### Buttons
- One visually prominent button style (filled with accent color) for primary actions.
- Secondary buttons: outline or ghost (text-only). Must be visually quieter than primary.
- Maximum 1 primary button per view section. If everything is emphasized, nothing is.

### Cards
- Separated by spacing or a single subtle border/background shift. Not by heavy shadows.
- Content within cards uses the same type and spacing system — no special rules inside cards.

### Forms
- Visible labels above inputs (not placeholder-only labels).
- Clear, quiet borders on idle state. Accent color on focus.
- Error messages adjacent to their field, not in a summary block elsewhere.

### Navigation
- Minimal chrome — navigation should not dominate the viewport.
- Active state indicated by the accent color or a subtle underline/weight shift. Not both.

---

## Decision Heuristics

Use these when making ambiguous choices:

| When uncertain about... | Default to... |
|---|---|
| Adding an element | Don't add it. Justify its presence first. |
| Spacing amount | More space, not less. |
| Number of colors | Fewer. |
| Font weight for a new level | Use existing weights before adding a new one. |
| Border vs. spacing for separation | Spacing. |
| Shadow intensity | Lighter than you think. |
| Animation duration | Shorter than you think. |
| Number of button styles | Fewer. One primary, one secondary, one ghost. |


*Use `var(--token-name)` throughout all implementation files. Every value must trace back to a token in this document.*
