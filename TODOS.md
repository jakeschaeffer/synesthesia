# TODOS

## Design Debt

### Responsive layout
Add responsive breakpoints. Mobile: stack layout, collapsible gradient canvas, 44px minimum touch targets, tap-to-edit instead of long-press for color editing. Long-press conflicts with native text selection on mobile. The adaptive canvas layout helps but doesn't solve the fundamental viewport constraint on phones (~180px usable after keyboard opens).
- **Why:** Mobile users currently get a broken experience. Touch targets at 24px are below WCAG minimum (44px).
- **Depends on:** Adaptive canvas layout implementation (done).
