# Synesthesia — Atlas · Design System

"Atlas" is the current incarnation of Synesthesia: a cream-paper editorial / letterpress field guide to seeing letters. It replaces the earlier dark dashboard (Radix dialogs, SplitScreen, CanvasRenderer) entirely. Every token below lives in [src/index.css](src/index.css); every component referenced lives directly under [src/components/](src/components/).

## Palette

All tokens are CSS custom properties on `:root` in [src/index.css](src/index.css).

| Token        | Value     | Role                                                                                |
| ------------ | --------- | ----------------------------------------------------------------------------------- |
| `--paper`    | `#f3ecde` | Base paper. App background, default `.btn`, modal fill.                             |
| `--paper-2`  | `#ece2ce` | Inset paper. Spectrogram bar, share preview, inputs, `.new-profile-row`.            |
| `--ink`      | `#1a1612` | Primary ink. All text, rules, borders, `.btn.solid` fill.                           |
| `--ink-soft` | `#3a332a` | Softer ink. Secondary copy, tagline, readout values.                                |
| `--rule`     | `#1a1612` | Reserved alias for ink, for future rule-color overrides.                            |
| `--muted`    | `#8a7f6b` | Quiet metadata: section-label body, tick labels, meta lines.                        |
| `--accent`   | `#b0442c` | Red accent: caret, `§` numerals, modal label, `.btn.accent`, masthead em-dash, active-profile tag. |

The `<body>` layers two radial glows (warm amber top-left, red-brown bottom-right) plus an SVG turbulence noise over `--paper` for a printed feel.

## Typography

Three families loaded in `index.html`. Roles do not mix.

| Family              | Used for                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Fraunces**        | Editorial copy and display italics. Masthead title (`opsz 144`, `SOFT 100`), section `<h2>`/`<h3>`, profile names, suggestion chips, readout values. Body uses `font-feature-settings: "ss01","ss02","liga"`. |
| **Instrument Serif** | Large glyphs only: the type input, Nudger preview swatch, atlas chip letter, share-preview word, spectrogram word-echo. Always ≥ 22 px. |
| **JetBrains Mono**  | All UI chrome: buttons, section labels, HSL readouts, tick labels, meta lines, `.label` kickers. Always uppercase with `.1em`–`.28em` letter-spacing. |

Key display sizes (all from `src/index.css`):

- Masthead title: `clamp(48px, 7.2vw, 108px)` italic
- Type input: `clamp(52px, 9vw, 140px)`
- Atlas `<h2>`: 38 px italic
- Modal `<h2>`: 34 px italic
- Nudger preview glyph: 88 px
- Share-preview word: `clamp(36px, 5vw, 64px)`

## Layout

The whole app is a single vertical column.

- `.page` — `max-width: 1360px`, padding `36px 48px 120px`, centered.
- Flow: **Masthead → TypeStage (§ 01) → SpectrogramBar → ControlsPanel (§ 02–04 + § 05) → AtlasGrid (§ 06) → footer**.
- Breakpoints:
  - `≤ 1100px` — atlas grid drops from 12 → 9 columns.
  - `≤ 900px` — controls grid collapses from `1.2fr 1fr` to 1 column (Nudger goes below the slider/buttons).
  - `≤ 700px` — page padding shrinks; masthead stacks into one column, title left-aligned at 64 px; atlas grid drops to 6 columns; atlas head stacks.

## Sections

The page is numbered like a printed field guide. Each uses `.section-label`: a 22-px ink rule, a red `.num` (`§ 01` etc.), then a wide-tracked monospaced name.

| §    | Name               | Component                                                        |
| ---- | ------------------ | ---------------------------------------------------------------- |
| 01   | The Utterance      | [TypeStage.tsx](src/components/TypeStage.tsx)                    |
| 02   | Blend Apparatus    | [ControlsPanel.tsx](src/components/ControlsPanel.tsx)            |
| 03   | Specimen Controls  | [ControlsPanel.tsx](src/components/ControlsPanel.tsx)            |
| 04   | Share & Export     | [ControlsPanel.tsx](src/components/ControlsPanel.tsx)            |
| 05   | The Nudger         | [NudgerEditor.tsx](src/components/NudgerEditor.tsx)              |
| 06   | The Atlas          | [AtlasGrid.tsx](src/components/AtlasGrid.tsx)                    |

## Components

### Masthead — [Masthead.tsx](src/components/Masthead.tsx)
Three-column grid (`1fr auto 1fr`) bottom-ruled with a double line. Left: tagline *"A Field Guide to / Seeing Letters."*. Center: `Synesthesia — Atlas` — the em-dash is the `.amp` span in accent red, 300-weight italic. Right: `{profile}'s palette` over today's date. A `.mast-sub` row below holds *Grapheme → Color Index*, a dot-separated hint (*Type, hear the palette*), and a `Manage profile →` button (`.profile-chip`, link-style, accent on hover).

### TypeStage — [TypeStage.tsx](src/components/TypeStage.tsx)
`.typebox` with a hint label (*Type a word, phrase, or name*) notched into its top rule. `.type-input` is borderless Instrument Serif, caret colored with `--accent`, placeholder italic at 22% ink opacity. Below sits `.suggest` — monospaced `try:` label, then six italic Fraunces chips with dotted underlines that turn accent on hover: **Monday, thunder, aubergine, 42 cathedrals, saudade, your name**. The input autofocuses 400 ms after mount, unless a `.modal-backdrop` is currently open.

### SpectrogramBar — [SpectrogramBar.tsx](src/components/SpectrogramBar.tsx)
Caption row above the bar: `Fig. A · Chromatic Spectrogram`, the word echoed in Instrument Serif italic 22 px (or `—` when empty), and `Blend {pct}%`. Bar is 120 px tall, 1-px ink border, `--paper-2` fill, subtle drop shadow. The filled gradient comes from `computeGradientStops` / `stopsToLinearGradient` in [gradientCalculation.ts](src/utils/gradientCalculation.ts). A multiply-blended SVG grain sits on top at `.35` opacity. Character tick cells render only when the filtered word length is 1–28 chars; spaces render as `·`.

### ControlsPanel — [ControlsPanel.tsx](src/components/ControlsPanel.tsx)
Two-column grid (`1.2fr 1fr`, collapsing to one column ≤ 900 px), separated from the stage by a 1-px ink top-rule. Left column hosts § 02 / § 03 / § 04; right column is the Nudger. Palette biases come from [palettes.ts](src/utils/palettes.ts) — buttons are labelled:

| Button label         | `PaletteBias` value |
| -------------------- | ------------------- |
| Warm Bias            | `warm`              |
| Cool Bias            | `cool`              |
| High Saturation      | `candy`             |
| Faded / Pastel       | `faded`             |

"Reroll Typed Letters" is the only `.btn.accent` — it rerolls only the unique a–z / 0–9 chars currently in the input (falls back to `rerollAll` if none).

### NudgerEditor — [NudgerEditor.tsx](src/components/NudgerEditor.tsx)
Ink-bordered card with a `.corner` tag in the top-right (`Glyph /a/` when editing, `—` when idle). Empty state: `.editor.empty .editor-body` drops to `opacity: .35`, `filter: saturate(.2)`, pointer-events none.

Top row (`.editor-top`) holds a 128×128 swatch displaying the glyph at 88 px in Instrument Serif, next to a `.readout` listing **Glyph**, **Hex**, **HSL** in a `k` / `v` pair (monospaced uppercase key, 18-px italic Fraunces value). `.hex` value uses monospaced 20 px.

Three `.nudge-row`s (`72px label | 1fr slider | auto value`) follow — Hue 0–360, Saturation 0–100, Lightness 5–92. Each `.rslider` is 14 px tall, bordered, with its track background set inline to a live HSL gradient of the relevant axis at the other two axes' current values (hue track shows a full rainbow at the current S/L; saturation track runs grey→saturated at the current H/L; lightness track runs near-black→mid→near-white at the current H/S).

Footer `.btn-row`: `↻ Reroll this one`, `Reset` (restores the color captured at the moment this char was selected, via `preEditRef`), `Done` (`.btn.solid`, clears `editorChar`).

### AtlasGrid — [AtlasGrid.tsx](src/components/AtlasGrid.tsx)
Separated from the controls by a 2-px ink rule. `.atlas-head` pairs the § 06 label + `<h2>` (*Every letter, every digit, its own voice.*) with a right-aligned meta line: `A–Z · 0–9 · [click to edit pill]`.

`.atlas-grid` is 12 columns (9 at ≤ 1100 px, 6 at ≤ 700 px), 6-px gap. Each `<button>` is a `.chip` with `aspect-ratio: 3/4`, 1-px ink border, background set inline to the char's hex. `.g` holds the glyph in Instrument Serif 30 px top-left; `.n` holds the hex in JetBrains Mono 8.5 px bottom-right. See *Chips & swatches* below for `data-lum` / `.active`. Each chip carries `aria-label="Edit color for {X}"`.

### Modal — [Modal.tsx](src/components/Modal.tsx)
Shared wrapper for all three modals. Rendered **conditionally** (`{open && <Modal …/>}`) — there is no `open` prop, no portal, no Radix. Dismissal:

- **Escape key** — global `window` `keydown` listener in a `useEffect`.
- **Backdrop click** — `onClick` on `.modal-backdrop` fires `onClose` only when `e.target === e.currentTarget` (ignores clicks inside the dialog).
- **`Close ✕`** button in `.modal-head`.

Structure: `.modal-backdrop` is fixed, `rgba(26,22,18,.55)` + `backdrop-filter: blur(4px)`, `fadeIn` 0.2 s. `.modal` is `min(680px, 100%)` wide, `max-height: 90vh`, bordered, paper-filled, `popIn` 0.28 s cubic-bezier(.2,.8,.2,1). `.modal-head` pairs an accent-colored monospaced `.label` (*§ Profiles*, *§ Share one word*, *§ Export full profile*) with a 34-px italic `<h2>`; `.modal-body` contains `.field`s and `.btn-row`s. Optional `.modal-body p.lede` is 15-px Fraunces at 58 ch max-width.

### ProfileManagerModal — [ProfileManagerModal.tsx](src/components/ProfileManagerModal.tsx)
`.profile-list` of `.profile-row`s (`24px dots | 1fr name+meta | auto rename | auto delete`). Each row shows a 4×2 grid of 6-px squares sampled from `a e i o s t r n`, the name in Fraunces italic 18 px with an accent `Active` tag when current, and a meta line of date + first 8 chars of the id. Rows are clickable / Enter-Space keyable for `loadProfile`; Rename/Delete use `.rowbtn` (`.danger` hover turns accent). `.new-profile-row` is pinned to the bottom of the list: name input + `+ Create fresh` (`.btn.solid`). Below, a second `.field` accepts a pasted share-code or `.json` file. Delete is blocked when only one profile remains.

### ShareWordModal — [ShareWordModal.tsx](src/components/ShareWordModal.tsx)
Word input + live `.share-preview` card (monospaced "Preview" kicker, the word rendered letter-by-letter in Instrument Serif colored per the map, a 36-px `.bar-mini` showing the gradient). Read-only `.link-textarea` holds the `buildShareUrl(encodeWordCode(...))` URL. Two buttons: `⎘ Copy link` (`.btn.solid`) and `⎘ Copy as SVG` (`.btn`, disabled while the word is blank). The SVG export is a single-line strip: 40-px-wide × 80-px-tall rects per char, each with the letter centered, `font-family: Georgia,serif`, italic 32 px, text color flipped to `#f6efe0` when the chip is dark (`color.l < 55`).

### ExportProfileModal — [ExportProfileModal.tsx](src/components/ExportProfileModal.tsx)
Name input (defaults to the active profile's name), the `encodeProfileCode` share URL, and `⎘ Copy link` / `⤓ Download .json` (via [profileTransfer.ts](src/utils/profileTransfer.ts)). JSON filename is slugified: `{name}.synesthesia.json`.

### Toast — [Toast.tsx](src/components/Toast.tsx) + [useToast.ts](src/hooks/useToast.ts)
Single fixed pill bottom-center. Ink background, paper text, JetBrains Mono 11 px, `.18em` uppercase. Driven by a module-level `showToast(msg)` the rest of the app calls directly (no props). Fades + slides via a toggled `.show` class; `role="status"` / `aria-live="polite"`.

## Buttons

All buttons share `.btn` — JetBrains Mono 10.5 px, `.2em` letter-spacing, uppercase, 10 × 14 padding, 1-px border, sharp corners (`border-radius: 0`), 0.15 s background/color transition.

| Variant         | Default                                    | Hover                                          |
| --------------- | ------------------------------------------ | ---------------------------------------------- |
| `.btn` (base)   | paper / ink / ink border                   | Ink fill, paper text                           |
| `.btn.accent`   | paper / accent text / accent border        | Accent fill, paper text, accent border         |
| `.btn.solid`    | ink fill, paper text                       | Accent fill, **accent border**, paper text     |
| `:disabled`     | `opacity: .45`, `cursor: not-allowed`      | (no hover response)                            |

Scoped variants:
- `.rowbtn` — smaller (9.5 px, 4 × 8 padding) for profile-row actions. `.rowbtn.danger:hover` turns accent.
- `.profile-chip` — borderless, underlined, link-style (masthead "Manage profile").
- `.modal-close` — small bordered button with the same hover as `.btn`.

## Modal pattern

- **Conditional mount, not an `open` prop.** `App.tsx` does `{profileOpen && <ProfileManagerModal …/>}`; close callbacks flip the boolean. When the modal isn't rendered, there is no backdrop in the DOM.
- **Escape closes** (global `keydown` listener registered on mount).
- **Backdrop click closes** via the `e.target === e.currentTarget` guard — clicks inside `.modal` bubble up but are ignored.
- **Top-right `Close ✕`** for discoverability.
- `role="dialog"` + `aria-label={title}`.
- One `Modal` instance at a time — the three modals are mutually exclusive in `App.tsx`.
- Content inside follows the `.modal-head` (label + h2 + close) / `.modal-body` (lede + fields + btn-row) pattern.

## Chips & swatches

`.chip` is the atlas unit — a `<button>` colored with the glyph's hex.

- **`data-lum`** is set by the component to `"dark"` (`color.l < 55`) or `"light"`. The CSS rule `.chip[data-lum="dark"] .g, .chip[data-lum="dark"] .n` flips glyph + hex label text to `#f6efe0` so letters remain readable on any hex the user picks.
- **`.chip.active`** (set when the Nudger is editing this char) applies a 2-px ink outline with 2-px offset.
- **Hover** lifts 2 px, scales 1.02, adds a 10–20 px ink shadow, raises `z-index`.
- **Mount animation** — `popIn` keyframe (`scale(.9) → 1`, `opacity 0 → 1`) over 0.35 s.

The same luminance-flip logic is reused in:
- Nudger preview swatch — inline `color` computed from `isDark`.
- Share-preview word letters — per-letter `color` set from `colorMap[char].hex`.
- Share-word SVG export — text `fill` flipped based on `color.l < 55`.

## Blend slider

- **Store state**: `gradientSettings.bleed` on the Zustand store, `0..1`, default `0.35` ([useSynesthesiaStore.ts:41](src/store/useSynesthesiaStore.ts:41)). Persisted in `localStorage` under `synesthesia-storage`.
- **UI range**: the `.ink`-styled `<input type="range">` in § 02 uses `min=0 max=100`. `ControlsPanel` bridges the two:
  - `value={Math.round(settings.bleed * 100)}`
  - `onChange={(e) => setBleed(+e.target.value / 100)}`
- **Labels**: `Hard` at the left `.end`, `Bled` at the right `.end`, `{pct}%` readout on the far right. The same `{pct}%` is echoed in the SpectrogramBar caption.
- **Track style** (`input[type="range"].ink`): 2-px ink line, 22 × 22 paper thumb with 2-px ink border and a 0 4px 10px ink shadow.

The sibling `wordMix` setting exists on the store with a default of `0.0` but is not currently exposed in the Atlas UI.

## Empty & disabled states

- **No text typed** — SpectrogramBar word-echo renders `—`; ticks are hidden; gradient still fills the bar with the first chars of any previous state / default.
- **No glyph selected in the Nudger** — `.editor.empty .editor-body` at 35 % opacity, desaturated, click-blocked; corner shows `—`; readouts show `—` / `#——————`.
- **Share disabled** — `Copy link` and `Copy as SVG` get `:disabled` styling whenever the preview word is blank; link area shows `—`.

## Animations

All in [src/index.css](src/index.css) (lines 616–625 and inline on components):

- `popIn` — 0.35 s cubic-bezier(.2,.8,.2,1) — chips on mount, modal dialog on open.
- `fadeIn` — 0.2 s ease-out — modal backdrop.
- Button hover — 0.15 s background / color.
- Chip hover — 0.18 s transform + shadow.
- Toast — 0.2 s opacity + 0.25 s translateY.

## Accessibility

- All interactive surfaces are native `<button>` / `<input>` / `<textarea>` — no `div`-as-button.
- Chips: `aria-label="Edit color for {X}"`.
- Toast: `role="status"`, `aria-live="polite"`.
- Modal: `role="dialog"`, `aria-label={title}`, Escape close.
- Profile rows: `role="button"`, `tabIndex={0}`, Enter / Space invoke `loadProfile`.
- Dark-chip text color is forced to `#f6efe0` so any user-chosen hex still meets the legibility bar.

Open gaps — focus trapping inside modals, initial-focus hand-off, and a few touch-target nits — are tracked in [TODOS.md](TODOS.md).
