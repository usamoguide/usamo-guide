# USAMO Guide redesign: views

Six views from the design canvas, one HTML file each. All data in them is placeholder.

## Open it

Open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and go to http://localhost:8000. The links between views work either way. Fonts come from Google Fonts, so the type only looks right with a connection.

## Files

| File | View |
| --- | --- |
| `index.html` | Landing page |
| `start.html` | Start learning, for new visitors: pick a level, get a first module |
| `dashboard.html` | Dashboard for a signed-in user (Login on any view leads here) |
| `track.html` | Track page, Foundations (AMC 8) |
| `module.html` | Module page: track sidebar, lesson, practice table, contents |
| `problems.html` | Problem search: topic sidebar, filters, cards |

| Path | What's in it |
| --- | --- |
| `css/base.css` | Reset, design tokens for light and dark, nav, buttons. Every view loads it first. |
| `css/landing.css` | Landing page only |
| `css/app.css` | Shared by the five app views |
| `css/<view>.css` | One per app view, loaded after `app.css` |
| `img/` | Mascot poses (`panda-*.webp`), the flags strip used on the landing page |
| `runtime/dc-runtime.js` | React plus the small runtime that renders the views. Minified, no need to read it. |

## How a view file works

Each view is a Design Component, which is close to a React class component written as an HTML template:

- The markup sits inside `<x-dc>`. `{{ name }}` prints a value from the view's script, `<sc-for list="{{ items }}" as="item">` repeats its contents, and `<sc-if value="{{ flag }}">` shows them only when the flag is true. Events bind the same way, as in `onClick="{{ pick }}"`.
- The behavior is the `<script type="text/x-dc">` at the bottom of the file: `class Component extends DCLogic`, a React class without `render()`. State lives in `this.state`. `renderVals()` returns every value the markup reads, and the app views add their own in `pageVals()`.
- Placeholder data sits at the top of that script as `UG_*` constants: the curriculum, problems, statuses and dashboard numbers.
- Printed values are wrapped in `span.sc-interp`, so style by an element's class rather than by a bare `span` inside it.
- `data-props` on the script tag lists the design-tool tweaks: theme and highlight color on every view, plus the purple, display font and motion on the landing page. `$preview` is the frame size on the canvas.

## Shared behavior

- Colors: one purple (`--v`) and one gold accent (`--acc`), both set in `base.css`. Purple does the structural work (text, links, primary buttons). Gold marks progress and reward: progress bars, completed checks and statuses, the active step, the "Start here" and "Continue" badges, buttons that sit on a purple band, stickers, speech bubbles, Featured badges, the streak and insights. Use `--acc-ink` when gold has to be text on white, and `--on-acc` for text sitting on gold.
- Theme: light by default. The moon button switches it and saves the choice in `localStorage` under `ug-theme`. Dark values are under `[data-theme="dark"]` in `base.css`.
- Display settings (gear button): show tags, show difficulty and show ignored problems, saved under `ug-prefs`.
- Problem statuses: Not attempted, Solving, Solved, Reviewing, Skipped, Ignored. Module statuses: Not started, Reading, Practicing, Complete, Skipped, Ignored.
- Breakpoints: the nav folds into a menu at 1180px. The module and problems sidebars fold into a panel at the top below 760px. Phone layouts start at 600px.
- Links to Discord, GitHub, contests, solutions and reports are placeholders (`#discord`, `#github` and so on).
