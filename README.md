# Synesthesia Visualizer

Some people hear middle C and see violet. Some see the letter *A* as red, always, the way other people know that fire is hot. Grapheme-color synesthesia — the experience of letters and numbers carrying color — is real, common, and deeply personal. No two people share exactly the same alphabet.

This is a tool for mapping yours.

Type a word. Watch its colors spill across the spectrogram. Click any letter in the atlas to dial in the hue, saturation, and lightness until it feels right. Save the result as a profile, share a word with a friend, or export your whole alphabet.

---

## What it does

**Type** — a word, a name, a phrase. The color bar above renders a chromatic spectrogram of it in real time, blending adjacent letter-colors according to a slider you control.

**Edit** — click any letter in the spectrogram bar, or click any chip in the alphabet grid below. The nudger panel opens with three live-gradient sliders: hue, saturation, lightness. The preview swatch and hex readout update as you drag.

**Save** — your colors are stored in a profile, auto-saved to your browser. You can keep multiple profiles — one for yourself, one for a partner whose alphabet you want to see.

**Share** — generate a link that encodes a single word's colors, or export your entire profile as a URL or `.json` file. Recipients can import it and see exactly what you see.

---

## Stack

React 19 · TypeScript · Vite · Zustand (persist) · culori (color math) · Tailwind CSS 4 · Google Fonts (Fraunces, Instrument Serif, JetBrains Mono)

No back-end. Everything lives in `localStorage`.

---

## Development

```bash
npm install
npm run dev
```

```bash
npm run build    # production bundle
npm run lint     # eslint
npm run test     # vitest
```

---

## Docs

- **[DESIGN.md](DESIGN.md)** — full design system reference: palette, typography, components, interaction patterns
- **[TODOS.md](TODOS.md)** — open work items
