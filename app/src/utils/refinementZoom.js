// View-only magnification for the Phase 4 Refine canvas.
// This never alters the working design or its undo/redo snapshots.
export const MIN_REFINEMENT_ZOOM = 50;
export const MAX_REFINEMENT_ZOOM = 200;
export const REFINEMENT_ZOOM_STEP = 10;

export function refinementZoomValue(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 100;
  return Math.min(MAX_REFINEMENT_ZOOM, Math.max(MIN_REFINEMENT_ZOOM, Math.round(num / REFINEMENT_ZOOM_STEP) * REFINEMENT_ZOOM_STEP));
}

export function nextRefinementZoom(value, direction) {
  const current = refinementZoomValue(value);
  return refinementZoomValue(current + Math.sign(direction) * REFINEMENT_ZOOM_STEP);
}

// Uses the browser's normal Ctrl+/Ctrl- key combinations when Refine is active.
// Do not override browser behaviour while a user is typing/editing text.
export function refinementZoomShortcut(event) {
  if ((!event.ctrlKey && !event.metaKey) || event.altKey) return 0;
  const target = event.target;
  if (target?.isContentEditable || target?.closest?.('input, textarea, select, [contenteditable="true"]')) return 0;
  if (event.code === 'NumpadAdd' || event.key === '+' || event.key === '=') return 1;
  if (event.code === 'NumpadSubtract' || event.key === '-' || event.key === '_') return -1;
  return 0;
}
