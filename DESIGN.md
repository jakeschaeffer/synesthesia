# Synesthesia Visualizer · Design System

A cream-paper, editorial / letterpress field guide. No dark mode, no cards, no modals-via-Radix. Everything is ink on paper — borders, rules, and type. All tokens live in [src/index.css](src/index.css); all components directly under [src/components/](src/components/).

---

## Palette

CSS custom properties on `:root`.

| Token        | Value     | Role                                                                                |
| ------------ | --------- | ----------------------------------------------------------------------------------- |
| `--paper`    | `#f3ecde` | Base paper. App background, default button fill, modal fill.                        |
| `--paper-2`  | `#ece2ce` | Inset paper. Spectrogram bar, share preview, text inputs, new-profile row.          |
| `--ink`      | `#1a1612` | Primary ink. Text, rules, borders, `.btn.solid` fill.                               |
| `--ink-soft` | `#3a332a` | Softer ink. Secondary copy, readout values, masthead tagline.                       |
| `--rule`     | `#1a1612` | Alias for ink, reserved for future rule-color overrides.                            |
| `--muted`    | `#8a7f6b` | Quiet metadata: section-label text, tick labels, blend-row end-labels.              |
| `--accent`   | `#b0442c` | Red. Caret, active-profile tag, `.btn.accent`, modal label kicker, active chip outline. |

The `<body>` layers two radial glows (warm amber top-left, red-brown bottom-right) plus an inline SVG turbulence noise over `--paper` for a printed feel. Scrollbar thumbs are `rgba(26,22,18,.2)` on transparent.

---

## Typography

Three families, each with a single job. Loaded from Google Fonts in `index.html`.

| Family              | Role                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| **Fraunces**        | Editorial and display. Masthead title (variable-font: `opsz 144`, `SOFT 100`), section `<h2>`/`<h3>`, profile names, blend-apparatus question, readout values. `font-feature-settings: "ss01","ss02","liga"` on `<body>`. |
| **Instrument Serif** | Large glyphs only. Type input, nudger preview swatch, atlas chip letter, share-preview word, spectrogram word-echo. Always ≥ 22 px. |
| **JetBrains Mono**  | All UI chrome. Buttons, section labels, HSL readouts, tick labels, metadata, modal label kickers. Always uppercase with `.1em`–`.28em` letter-spacing. |

Key display sizes:

| Element              | Size                       |
| -------------------- | -------------------------- |
| Masthead title       | `clamp(48px, 7.2vw, 108px)` italic |
| Type input           | `clamp(52px, 9vw, 140px)` |
| Atlas `<h2>`         | 38 px italic               |
| Blend question       | 16 px italic (Fraunces)    |
| Modal `<h2>`         | 34 px italic               |
| Nudger preview glyph | 88 px                      |
| Share-preview word   | `clamp(36px, 5vw, 64px)`  |

---

## Layout

Single vertical column. No split screen.

- `.page` — `max-width: 1360px`, padding `36px 48px 120px`, centered.
- Top-to-bottom flow: **Masthead → TypeStage → SpectrogramBar (+ blend + share) → ControlsPanel (Nudger) → AtlasGrid → footer.**
- Breakpoints:
  - `≤ 1100px` — atlas grid: 12 → 9 columns.
  - `≤ 900px` — controls: `1.2fr 1fr` → 1 column.
  - `≤ 700px` — page padding shrinks; masthead stacks to single column, title left-aligned at 64 px; atlas grid → 6 columns; atlas head stacks; `.bar-controls` stacks vertically.

---

## Components

### Masthead — [Masthead.tsx](src/components/Masthead.tsx)

Three-column grid (`1fr auto 1fr`) bottom-ruled with a double line. Left: *"Type letters, see colors."* in `--ink-soft`. Center: `Synesthesia` + italic `Visualizer` (`clamp(48px, 7.2vw, 108px)`). Right: `{profile}'s palette` and a `Manage profile →` link-style button (`.profile-chip`, accent on hover) that opens the profile modal.

The masthead has no subtitle row or date — just the three columns.

### TypeStage — [TypeStage.tsx](src/components/TypeStage.tsx)

`.typebox` with a notched hint label (*"Type a word, phrase, or name"*) set into its top rule. `.type-input` is borderless Instrument Serif filling the box, caret in `--accent`, placeholder italic at 22% ink opacity.

Below the typebox: `.suggest` — a monospaced `try:` label followed by six italic Fraunces chips with dotted underlines that turn accent on hover: **Monday, thunder, aubergine, 42 cathedrals, saudade, your name.** Clicking a chip sets the text and re-focuses the input.

The input autofocuses 400 ms after mount, selecting all existing text. Focus is skipped if a `.modal-backdrop` is open.

### SpectrogramBar — [SpectrogramBar.tsx](src/components/SpectrogramBar.tsx)

Three stacked zones:

**Caption** — `.bar-caption` shows the word echoed in Instrument Serif italic 22 px (or `—` when empty).

**Bar** — 120 px tall, 1-px ink border, `--paper-2` fill, subtle drop shadow. Gradient from `computeGradientStops` / `stopsToLinearGradient`. A multiply-blended SVG grain overlay at `.35` opacity. When the word is 1–28 chars, tick cells render per character; spaces become `·`. **The entire bar is clickable** — clicking calculates which character the click landed on (by horizontal ratio) and calls `setEditorChar`, opening that letter in the Nudger. Individual tick cells are `<button>`s with `aria-label`s; spaces are disabled.

**Controls row** (`.bar-controls`) — below the bar, flex row space-between:
- Left: `.blend-inline` — a Fraunces italic question (*"How much do the letters bleed into one another?"*) above a four-column row: `Hard` label, `.ink.mini` range slider (0–100, maps to 0..1 `bleed`), `Bled` label, percentage readout.
- Right: `☍ Share This Word` button (`.btn.solid`, disabled until the word is non-empty).

On mobile (≤ 700px), `.bar-controls` stacks vertically; the share button aligns to the right.

### ControlsPanel — [ControlsPanel.tsx](src/components/ControlsPanel.tsx)

Thin wrapper — renders the `.controls` section containing only `<NudgerEditor />`. The grid layout (`1.2fr 1fr`, collapsing ≤ 900 px) still applies for future use.

### NudgerEditor — [NudgerEditor.tsx](src/components/NudgerEditor.tsx)

Ink-bordered `.editor` card with a `.corner` label top-right (`Glyph /a/` when editing, `—` when idle). Section label: *"The Nudger."*

**Empty state** — `.editor.empty .editor-body` renders at `opacity: .35`, `filter: saturate(.2)`, pointer-events none.

**Top row** (`.editor-top`) — 128×128 swatch (background: the char's hex, text color flipped to `#f6efe0` when `color.l < 55`) displaying the glyph at Instrument Serif 88 px, beside a `.readout` listing **Glyph / Hex / HSL** as `k` (monospaced uppercase muted) / `v` (18 px italic Fraunces) pairs.

**Three `.nudge-row`s** — Hue 0–360°, Saturation 0–100%, Lightness 5–92%. Each `.rslider` (14 px tall, 1-px ink border, 10×22 paper thumb) gets its `background` set inline to a live gradient of that axis at the other two axes' current values.

**Footer** — `↻ Reroll this one` · `Reset` (restores color from when this char was selected) · `Done` (`.btn.solid`, calls `setEditorChar(null)`).

### AtlasGrid — [AtlasGrid.tsx](src/components/AtlasGrid.tsx)

Separated from the controls by a 2-px ink rule. Header: *"The Atlas"* section label + `<h2>` *"Every letter, every digit."* + right-aligned meta `A–Z · 0–9 · [click to edit pill]`.

Twelve-column chip grid (9 cols ≤ 1100 px, 6 cols ≤ 700 px), 6-px gap. Each `<button>` chip is `aspect-ratio: 3/4`, background = the char's hex, `.g` (Instrument Serif 30 px, top-left) + `.n` (JetBrains Mono 8.5 px hex, bottom-right). Clicking calls `setEditorChar` and scrolls attention to the Nudger. See *Chips* below.

Below the grid: `⤓ Export Profile` button (`.btn.solid`).

### Modal — [Modal.tsx](src/components/Modal.tsx)

Shared wrapper. Rendered **conditionally** in `App.tsx` — no `open` prop, no portal. Only one modal is open at a time.

Dismissal: **Escape** (global `keydown`), **backdrop click** (`e.target === e.currentTarget` guard), **`Close ✕`** button.

Structure: `.modal-backdrop` fixed, `rgba(26,22,18,.55)` + `blur(4px)`, `fadeIn` 0.2 s. `.modal` paper card `min(680px, 100%)` wide, `max-height: 90vh`, bordered, `popIn` 0.28 s. `.modal-head`: accent monospaced `.label` kicker + 34 px italic `<h2>` + close button. `.modal-body`: `.lede` (15 px Fraunces, ≤58 ch) + `.field`s + `.btn-row`s.

### ProfileManagerModal — [ProfileManagerModal.tsx](src/components/ProfileManagerModal.tsx)

Label: *§ Profiles.* Profile list rows: 4-col (`24px dot-preview | 1fr name+meta | Rename | Delete`). Dot preview samples chars `a e i o s t r n` as 6×6 colored squares. Active row background: `rgba(accent, .08)`. Rename uses `window.prompt`; delete uses `window.confirm` and is blocked when only one profile remains. New-profile row: text input + `+ Create fresh`. Below: paste-a-code textarea + `Load .json file`.

### ShareWordModal — [ShareWordModal.tsx](src/components/ShareWordModal.tsx)

Label: *§ Share one word.* Word input → live preview (per-letter Instrument Serif colored from the map + 36 px mini-bar gradient) → read-only link textarea → `⎘ Copy link` + `⎘ Copy as SVG`. SVG: 40×80-per-letter rects, Georgia italic 32 px, text color auto-flipped based on luminance.

### ExportProfileModal — [ExportProfileModal.tsx](src/components/ExportProfileModal.tsx)

Label: *§ Export full profile.* Name input (defaults to active profile) → shareable link → `⎘ Copy link` + `⤓ Download .json`. JSON filename: `{slugified-name}.synesthesia.json`.

### Toast — [Toast.tsx](src/components/Toast.tsx) + [useToast.ts](src/hooks/useToast.ts)

Fixed bottom-center pill. Ink fill, paper text, JetBrains Mono 11 px uppercase. Called via `showToast(msg)` anywhere in the codebase. Slides and fades via a toggled `.show` class. `role="status"` / `aria-live="polite"`.

---

## Buttons

`.btn` — JetBrains Mono 10.5 px, `.2em` letter-spacing, uppercase, `10px 14px` padding, 1-px border, sharp corners, 0.15 s transition.

| Variant       | Default                             | Hover                                      |
| ------------- | ----------------------------------- | ------------------------------------------ |
| `.btn`        | paper bg / ink text / ink border    | Ink fill, paper text                       |
| `.btn.accent` | paper bg / accent text / accent border | Accent fill, paper text                 |
| `.btn.solid`  | Ink fill / paper text               | Accent fill, accent border, paper text     |
| `:disabled`   | `opacity: .45` / `cursor: not-allowed` | No hover                                |

Scoped variants: `.rowbtn` (9.5 px, 4×8 padding, profile-list actions; `.danger` hover → accent). `.profile-chip` (borderless, underlined link style, masthead). `.modal-close` (small bordered, top-right of modal head).

---

## Modal pattern

- Conditional mount: `{open && <Modal …/>}` — no DOM overhead when closed.
- Escape key and backdrop click both call `onClose`; they're the same function.
- Backdrop guard: `e.target === e.currentTarget` prevents bubbled clicks from closing the dialog.
- `role="dialog"` + `aria-label={title}` on `.modal`.
- One modal open at a time — three boolean flags in `App.tsx`.

---

## Chips

`.chip` — `<button>`, `aspect-ratio: 3/4`, background = hex, 1-px ink border.

- `data-lum="dark"` (set when `color.l < 55`) flips `.g` and `.n` text to `#f6efe0` so the glyph label stays legible on any hex.
- `.chip.active` — 2-px ink outline, 2-px offset. Set while the Nudger is editing that char.
- Hover — lifts 2 px, scales 1.02, ink shadow, `z-index` raised.
- Mount — `popIn` keyframe (scale .9 → 1, opacity 0 → 1, 0.35 s).

The same luminance flip (`color.l < 55` → `#f6efe0`) is applied in the Nudger swatch, share-preview letters, and SVG export text.

---

## Blend slider

Stored as `gradientSettings.bleed` (0..1, default `0.35`) in the Zustand store, persisted to `localStorage`. The UI slider uses `min=0 max=100`; `SpectrogramBar` bridges with `setBleed(+e.target.value / 100)`. Display value: `Math.round(settings.bleed * 100)` + `%`.

Track style (`.ink.mini`): 2-px ink line, 16×16 paper thumb, 1.5-px ink border. End labels: `Hard` / `Bled` in JetBrains Mono muted uppercase.

---

## State

Zustand store with `localStorage` persistence via `zustand/middleware`. Persisted keys: `profiles`, `activeProfileId`, `colorMap`, `gradientSettings`. `editorChar` is ephemeral (not persisted).

Key store actions: `setText`, `setColorForChar`, `setBleed`, `createProfile`, `loadProfile`, `deleteProfile`, `renameProfile`, `rerollAll`, `rerollLetters`, `applyPaletteBias`, `setEditorChar`.

---

## Animations

- `popIn` — scale(.9) → 1, opacity 0 → 1, 0.35 s cubic-bezier(.2,.8,.2,1). Chips on mount, modal dialog on open.
- `fadeIn` — opacity 0 → 1, 0.2 s ease-out. Modal backdrop.
- Button hover — 0.15 s background / color.
- Chip hover — 0.18 s transform + shadow.
- Toast — 0.2 s opacity + 0.25 s translateY.

---

## Accessibility

- All interactive surfaces are native `<button>` / `<input>` / `<textarea>`.
- Chip buttons: `aria-label="Edit color for {X}"`.
- Spectrogram tick buttons: `aria-label="Select {X} for nudging"` / `"Space"` when disabled.
- Spectrogram bar: `role="group"` / `aria-label="Color strip"`.
- Toast: `role="status"` / `aria-live="polite"`.
- Modal: `role="dialog"` / `aria-label={title}`.
- Profile rows: `role="button"` / `tabIndex={0}` / Enter-Space keydown handling.
- Dark-chip text forced to `#f6efe0` to preserve contrast on user-chosen hex values.

Open gaps (focus trap, touch targets, native dialogs) are tracked in [TODOS.md](TODOS.md).
