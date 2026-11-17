// Rotation helpers are shared by the canvas, edit history and local exports.
// Keep rotation out of the source recommendation: only the working copy changes.
export function normaliseRefinementRotation(value) {
  const n = Number(value);
  if (value === '' || value == null || !Number.isFinite(n)) return 0;
  const wrapped = ((n % 360) + 360) % 360;
  const signed = wrapped > 180 ? wrapped - 360 : wrapped;
  return Math.round(signed * 10) / 10 || 0;
}

export function rotationPointerAngle(clientX, clientY, pivotX, pivotY) {
  return Math.atan2(clientY - pivotY, clientX - pivotX) * 180 / Math.PI;
}

export function rotationFromPointer(startRotation, startAngle, currentAngle, snap = false) {
  // Shortest angular distance handles the -180/180 boundary without jumping.
  const delta = normaliseRefinementRotation(currentAngle - startAngle);
  const raw = normaliseRefinementRotation(startRotation + delta);
  return snap ? normaliseRefinementRotation(Math.round(raw / 15) * 15) : raw;
}
