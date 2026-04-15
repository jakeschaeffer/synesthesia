# Synesthesia Design System

## Colors

### Backgrounds
- **Base:** `#0e0e18` — app background, canvas empty state
- **Surface:** `#1a1a2e` — dialogs, modals, toasts, dropdowns
- **Canvas empty:** `#12121c` — gradient canvas when no text

### Text opacity scale (on dark backgrounds)
- `white/20` — placeholder text only
- `white/40` — slider endpoint labels, secondary descriptive text
- `white/50` — control labels, value displays, minimum for functional text
- `white/60` — button text (default state)
- `white/70` — feedback messages, tooltip text
- `white/80` — primary button text, dialog titles, important content
- `white/90` — high-emphasis actions (Save PNG)

### Borders
- `white/5` — section separators (subtle)
- `white/10` — component borders (dialogs, inputs, modals)
- `white/25` — focus states on inputs

### Accent
- `red-400/60` — destructive button default
- `red-400/90` — destructive button hover
- `blue-400/80` — undo link text

## Typography

### Font families
- **Display (monospace):** `'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace` — colored letter display, textarea
- **UI (system):** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` — all controls, labels, dialogs, buttons

### Sizes
- `text-3xl` — main text input display
- `text-2xl` — color variant modal letter display
- `text-sm` — dialog body text, toast messages, input fields
- `text-xs` — all control labels, buttons, slider values, profile UI

## Spacing

### Component padding
- Dialogs: `p-5`
- Controls bar: `px-4 py-3`
- Profile bar: `px-4 py-2`
- Buttons: `px-3 py-2`
- Inputs: `px-3 py-2`

## Components

### Dialogs
Use Radix UI Dialog. Overlay: `bg-black/50 backdrop-blur-sm`. Content: `bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl`.

### Modals (floating)
`bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl`.

### Buttons
- Default: `bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80`
- Primary: `bg-white/10 hover:bg-white/15 text-white/80`
- Destructive: `text-red-400/60 hover:text-red-400/90 bg-white/5 hover:bg-red-400/10`
- Disabled: `opacity-30 cursor-not-allowed`

### Toasts
Fixed bottom-center. `bg-[#1a1a2e] border border-white/10 rounded-lg shadow-2xl`. Auto-dismiss after 3 seconds. Include undo action for destructive operations.

## Interaction patterns

### Color editing
- Click or long-press (400ms) on a colored letter to open variant picker
- Hover: letters scale to 110% with color glow (`drop-shadow-[0_0_6px_currentColor]`)
- First-use tooltip shown after 3+ characters typed, dismisses after 4 seconds

### Adaptive layout
- Canvas starts at 0 height, grows to 50% when text is present
- Transition: 500ms ease-out
- Text input area fills full height on empty state

## Accessibility minimums

- All functional text: minimum `white/50` (WCAG AA contrast on `#0e0e18`)
- Touch targets: 44px minimum height for interactive elements
- Keyboard navigation: arrow keys in color variant modal, Escape to close
- Focus rings: `ring-2 ring-white/30` on interactive elements
