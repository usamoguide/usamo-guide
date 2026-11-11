# UI Guide — USAMO / USACO Guide

This document describes the project's UI system in full detail: colors, typography, spacing, components, navigation, animations, accessibility, and implementation tokens (CSS variables). It is intended as a single-source reference for designers and developers working on the site.

---

## 1. Overview

- Purpose: Provide a coherent, accessible, and maintainable visual system for the problem reference and learning site.
- Scope: global design tokens (colors, typography, spacing), common components (navbar, buttons, cards, forms), layout patterns (grid, sidebars), and motion/animation guidelines.

## 2. Design Tokens (single source of truth)

All tokens should be exposed as CSS custom properties in `:root` and mirrored in Tailwind config where appropriate.

### 2.1 Color Palette

Primary brand colors
- Primary: #0B5FFF — used for primary actions, links, active states
- Primary-700: #0849cc
- Primary-100: #EAF3FF — light background tint for primary

Neutrals
- Gray-900: #0B0E13 (text primary)
- Gray-800: #16181D
- Gray-700: #2B2F36
- Gray-600: #444950
- Gray-500: #6B7179
- Gray-300: #DDE2E8 (borders, dividers)
- Gray-100: #F7F8FA (page background)

Accent / semantic
- Success: #1AAE7A
- Warning: #FFB020
- Danger: #E5484D
- Info: #2F80ED

Surface colors
- Surface-100 (card): #FFFFFF
- Surface-200 (muted panel): #FAFBFD

Text color scale
- Text-primary: var(--color-gray-900)
- Text-secondary: var(--color-gray-600)
- Text-muted: var(--color-gray-500)

Usage rules
- Use `--color-primary` for primary buttons, important links, and focus outlines when visible.
- Reserve `Success/Warning/Danger` for states, badges, and toasts.
- Use neutrals for typography and borders. Keep contrast WCAG AA at minimum for body text; aim AAA for important headings where feasible.

### 2.2 Semantic tokens (CSS var examples)

:root (example tokens)

```
--color-primary: #0B5FFF;
--color-primary-700: #0849cc;
--color-bg: #F7F8FA;
--color-surface: #FFFFFF;
--color-text: #0B0E13;
--color-muted: #6B7179;
--color-border: #DDE2E8;
--color-success: #1AAE7A;
--color-warning: #FFB020;
--color-danger: #E5484D;
```

## 3. Typography

Base choices
- Primary typeface: `Phantom Sans, system-ui, sans-serif`, with locally hosted weight-specific assets.
- Weight scale: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

Scale
- Display / page title: 32px / 40px line-height 1.1, 700
- H1: 28px / 36px, 700
- H2: 22px / 30px, 600
- H3: 18px / 26px, 600
- Body: 16px / 24px, 400
- Small: 14px / 20px, 400

Microcopy
- UI labels, captions: 12-13px, 400, letter-spacing 0.01em.

Usage
- Problem titles: H1/H2 depending on page layout. Use heavier weights for emphasis on difficulty or tags.
- Code blocks: use a monospace stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New'`.

## 4. Spacing & Layout

- Layout grid: 12-column responsive grid on desktop, single column on mobile.
- Base spacing unit: 8px. Spacing scale: 4, 8, 12, 16, 24, 32, 40, 48.
- Container widths:
  - Mobile: full width with 16px side padding
  - Tablet: max-width 720px
  - Desktop: max-width 1100px (content column), with optional wider docs views up to 1280px.

## 5. Breakpoints

- xs: 0–479px (mobile)
- sm: 480–767px (large phones)
- md: 768–1023px (tablets)
- lg: 1024–1439px (laptop)
- xl: 1440px+ (large screens)

## 6. Navbar / Header

Structure
- Left: logo (click to home)
- Center / left: primary nav links (Problems, Modules, Docs) — collapsed into hamburger on mobile
- Right: search (icon + incremental results), user menu (avatar/login), theme toggle

Behavior
- Sticky on scroll: The navbar should become compact after the user scrolls 56px. Use a subtle backdrop blur and shadow when sticky.
- Mobile: hamburger toggles a full-height slide-in panel from left containing nav links and quick actions.
- Search: autosuggest dropdown with keyboard navigation (arrow keys), esc to close, enter to select.

Visuals
- Height: 72px desktop, 56px compact sticky or mobile header
- Background: transparent on top of hero; surface (white) with border and subtle shadow when scrolled.
- Active link: `--color-primary` underline or bold weight + small indicator dot.

Accessibility
- Provide `aria-expanded`, `aria-controls` for the mobile menu; skip links at top for keyboard users.

## 7. Sidebar / TOC (for module/problem pages)

- Collapsible right sidebar for table-of-contents and quick-links. Hidden on mobile, available via an affordance.
- Sticky position as the user scrolls through long content; ensure it never overlaps content or footer.
- On narrow screens, provide `toc` as a dropdown above content.

## 8. Buttons

Design tokens
- Border radius: 8px (large) for primary brand look; 6px for compact buttons; 4px for tiny controls.
- Elevation: use subtle shadow only on primary floating actions.
- Sizes:
  - Large: height 48px
  - Default: height 40px
  - Small: height 32px

Variants
- Primary (filled): background `--color-primary`, text white. Hover: darken 8-12% (use `--color-primary-700`). Active: inset shadow and 2px translateY.
- Secondary (outline): background transparent, border `--color-border` or `--color-primary` when emphasized; text `--color-text` or `--color-primary`.
- Ghost: transparent background, subtle hover background `--color-surface`.
- Danger: filled with `--color-danger` for destructive actions.
- Disabled: 50% opacity or `--color-muted` for text, cursor not-allowed.

Icon buttons
- Square with equal padding; accessible label via `aria-label`.

Behavior
- Click feedback: 100ms touch ripple or 60ms scale/opacity change; prefer subtle transforms over heavy ripples for web consistency.

## 9. Forms & Inputs

Inputs
- Height: 40px default, 32px small, 48px large
- Border: 1px solid `--color-border`; focus: 2px ring with `--color-primary-100` or `--color-primary` glow.
- Placeholder: `--color-muted`.
- Error state: border `--color-danger`, inline message text `--color-danger`.

Textareas
- Min-height for post/comment areas: 120px, resizable vertically.

Selects / Toggles
- Use native selects for performance where acceptable or accessible custom select with ARIA patterns.
- Toggle switches: background neutral, with checked thumb animated slide and colored background `--color-primary`.

Validation
- Inline messages below inputs; ARIA `aria-invalid` and `aria-describedby` linking to message.

## 10. Cards, Lists, and Problem Pages

Cards
- Surface: `--color-surface` with 1px `--color-border` and 8px border-radius, 16px padding.
- Use subtle elevation on hover: translateY(-4px) and slightly stronger shadow.

Problem List / Bank
- List item layout: left tag badges (difficulty, topic), center title + snippet, right metadata (solved count, timeEstimate)
- Hover: surface highlight and show quick actions (bookmark, favorite)
- Infinite loading: skeleton rows matching content height.

Problem page
- Two-column layout on desktop: content column (main problem statement & solutions) and right column (tags, similar problems, toc)
- Inline solution toggles: collapsed summary with `Show solution` button revealing code block and explanation.
- Inline source code: monospace background `#0f1720` (dark) with syntax highlighting; include copy-to-clipboard button top-right of code blocks.

Editor-like components
- Use a lightweight, read-only code renderer for solutions with line numbers optionally toggleable.

## 11. Modals, Toasts, and Popovers

Modals
- Centered modal with max-width 720px, backdrop color rgba(7,8,10,0.45), content surface `--color-surface`, padding 24px.
- Enter/exit animation: scale from 0.98 to 1.00 + fade in over 180ms ease-out; exit reverse over 150ms ease-in.
- Close on backdrop click and Esc; trap focus while open.

Toasts
- Corner toast stack top-right; small card with icon and text, auto-dismiss after 5–8s with progress bar optional. Use motion: slide from right + fade.

Popovers and dropdowns
- Use 8px offset from trigger; small shadow; adapt placement to viewport using a library (Popper) or CSS with JS.

## 12. Icons & Imagery

Iconography
- Use a single vector icon set (Heroicons outline/solid for consistency) optimized as SVG sprite or as inlined SVGs.
- Sizes: 16/20/24/32 depending on usage.

Illustrations
- Use minimal illustrative language for empty states and promotion panels; keep a consistent color treatment using brand tints.

## 13. Animations & Motion

Motion tokens
- Easing: `standard: cubic-bezier(0.2, 0.8, 0.2, 1)`; `decay: cubic-bezier(0.0, 0.0, 0.2, 1)`; `elastic` reserved for playful micro-interactions only.
- Durations:
  - micro: 80ms (press feedback)
  - short: 150–180ms (toggles, tooltips)
  - medium: 260–320ms (dialogs, panel slides)
  - long: 420–560ms (page-level transitions)

Interaction patterns
- Prefer transform + opacity over layout-triggering animations (avoid animating height where possible; use scale and translate instead).
- Reduce motion: respect `prefers-reduced-motion` and provide instant fallbacks or shorter fades.

Examples
- Button hover: scale(1.02) and shadow increase over 150ms.
- Dropdown open: opacity 0 -> 1 and translateY(-6px) -> 0 over 180ms ease-out.

## 14. Accessibility

Color contrast
- Ensure body text ratio >= 4.5:1; large headings >= 3:1.
- Provide high-contrast theme variant for users who require it.

Keyboard
- All interactive controls reachable via Tab; visible focus ring (2px solid or 3px outline with `--color-primary`), and logical tab order.

Screen readers
- Use semantic HTML; aria labels and live regions for dynamic content (toasts, loading states).
- For problem steps and code blocks, provide accessible summaries and `aria-live` updates when content loads asynchronously.

Forms
- Link labels and inputs with `for` and `id`; use inline error text with `aria-describedby`.

Motion
- Respect `prefers-reduced-motion` CSS media query and user agent settings;

## 15. Responsive Behavior

- Collapse multi-column layouts to single column under `md` breakpoint.
- Hide non-essential chrome (e.g., sidebars, large banners) on small screens.
- Use progressive disclosure for long content: "Jump to solution" anchor, fold long examples by default.

## 16. Theming & Dark Mode

Dark mode tokens
- Background-dark: #0B0F14
- Surface-dark: #0F1720
- Text-dark: #E6EEF3
- Muted-dark: #9AA6B2
- Accents: use same hue but brighter tints for contrast (e.g., primary #2E7AFF on dark)

Switch
- Theme toggle persisted in localStorage; support `prefers-color-scheme` automatic default. Provide accessible toggle with `aria-pressed`.

Visual adjustments
- In dark mode, increase focus rings slightly and prefer translucent surfaces with blur instead of pure opaque blocks.

## 17. Developer Implementation Notes

- Expose tokens as CSS variables under `:root` and a `.theme--dark` modifier class for dark mode.
- Mirror tokens in `tailwind.config.js` theme extension to keep class-based utility styling consistent.
- Build small React primitives for `Button`, `Card`, `Input`, `Modal`, and `Nav` that accept `size`, `variant`, and `tone` props and map to tokens.
- Use a single animations helper file to centralize durations and easings for use in JS-driven transitions.

CSS example (to include in global styles)

```
:root {
  --radius: 8px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --color-primary: #0B5FFF;
  --color-bg: #F7F8FA;
  --color-surface: #FFFFFF;
  --color-text: #0B0E13;
  --color-border: #DDE2E8;
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

## 18. Accessibility Checklist (for PRs)

- [ ] All interactive elements have accessible names
- [ ] Keyboard navigation works across pages and modals
- [ ] Color contrast checked for all text states
- [ ] Focus styles visible and consistent
- [ ] ARIA roles used only when necessary
- [ ] `prefers-reduced-motion` honored

## 19. Examples & Patterns (quick reference)

- Primary CTA: `Button variant="primary" size="default"`
- Secondary action: `Button variant="outline" size="small"`
- Problem card: `Card` with `Badge(difficulty)` and meta row(right-aligned)
- Inline solution: `details`/`summary` pattern or a controlled `Accordion` with `aria-controls`.

---

If you'd like, I can:
- Convert these tokens into `:root` CSS file and `tailwind.config.js` entries.
- Implement React primitives for the core components (`Button`, `Input`, `Modal`) using the tokens.
