/** Keyboard-only alternative to pointer dragging within the structured card editor.
 * Keeps the same placement limits as dragging; returns null for irrelevant keys.
 */
const KEY_STEPS = Object.freeze({
  ArrowUp: [0, -1], ArrowDown: [0, 1],
  ArrowLeft: [-1, 0], ArrowRight: [1, 0],
});
const limit = (n, min, max) => Math.min(max, Math.max(min, n));

export function keyboardObjectNudge(object, event, kind = 'text') {
  const delta = KEY_STEPS[event?.key];
  if (!object || !delta || event.ctrlKey || event.altKey || event.metaKey) return null;
  if (!Number.isFinite(object.x) || !Number.isFinite(object.y)) return null;
  const step = event.shiftKey ? 5 : 1;
  const x = limit(object.x + delta[0] * step, 2, kind === 'mark' ? 98 : 92);
  const y = limit(object.y + delta[1] * step, 8, 92);
  if (x === object.x && y === object.y) return null;
  return { x, y };
}
