# TODOS

## Interaction

### Keyboard shortcut for the profile manager
Bind something like `⌘/Ctrl + P` (or a less-claimed chord) to open the Profile Manager modal. Right now the only entry point is the `Manage profile →` link in the masthead — easy to miss and requires a mouse trip. Add the listener in `App.tsx` next to the existing hash-import effect and feed it into `setProfileOpen`.
- **Why:** Power users switch profiles often (self ↔ partner ↔ friend). A shortcut would remove most of that friction.
- **Watch out for:** Don't swallow the browser's native print shortcut without an intentional trade-off.

### Replace `window.confirm` / `window.prompt` with in-app modals
Profile rename, delete, and the hash-import accept prompts all use the native browser dialogs. They're jarring against the letterpress aesthetic and block the thread. Replace each with an inline `Modal`-based flow (rename inline in the row, delete with a small confirm dialog, hash-import with a preview in the existing modal chrome).
- **Why:** Visual consistency and better control over the Escape / backdrop behavior.

### Modal focus management
`Modal.tsx` has Escape + backdrop-click dismissal but no focus trap and no auto-focus on open. Tab can escape to the page under the backdrop, and screen readers land wherever the DOM puts them.
- **Why:** Accessibility + keyboard UX. Low cost, high polish.

## Share & Export

### Configurable SVG export (filename + dimensions)
`ShareWordModal.copySvg` only copies to the clipboard, and both dimensions (40 × 80 per letter) and font (Georgia italic 32 px) are hardcoded. Add a real "Download .svg" action with a slugified filename (mirror `ExportProfileModal.downloadJson`), and expose at least the cell size as a user-visible choice (small / medium / large) so people can match the aspect ratio they need.
- **Why:** Users want to drop the SVG into other tools (Figma, slides, a blog post) without re-exporting via a screenshot.

### Restore share-code tests
`src/__tests__/shareUtils.test.ts` was removed during the rebuild; `shareCodes.ts` and `profileTransfer.ts` now have no direct test coverage. Port over the old assertions (round-trip encode/decode, malformed-code rejection) to the new module.
- **Why:** Share codes are the only way users hand state to each other — a silent regression would be invisible until someone complains.

## Polish

### Long-word behavior in the SpectrogramBar
Tick cells disappear silently above 28 characters, leaving just the gradient. Either abbreviate (first N · last N), group ticks, or swap to a denser renderer past the threshold — but the current behavior reads as a bug.
- **Why:** Names and phrases often go past 28 chars.

### Touch targets in modal rows
`.rowbtn` (Rename / Delete in the profile list) and `.modal-close` are below the 44-px WCAG touch minimum on phones. Bump padding or force a min-height in the `≤ 700px` breakpoint.
- **Why:** The page responds well at narrow widths; the modal controls lag behind.
