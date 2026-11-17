import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normaliseRefinementRotation, rotationPointerAngle, rotationFromPointer,
} from '../src/utils/refinementRotation.js';
import {
  makeRefinementComposition, editRefinement, undoRefinement, redoRefinement,
} from '../src/utils/refinementDraft.js';
import { buildRefinementSvg } from '../src/utils/refinementExport.js';
import { proposeRefinementRequest } from '../src/utils/refinementChanges.js';

const concept = (styleId = 'minimal') => ({ id: `test-${styleId}`, name: styleId,
  styleId, background: '#223344', foreground: '#ffffff', accent: '#88aacc',
  brand: 'FORM /', role: 'DESIGNER', layout: 'structured', typography: 'serif',
});
const project = (styleId = 'minimal', selectedIds = ['name']) => ({
  id: 11, messages: [{ id: 7, concepts: [concept(styleId)] }],
  refinement: {
    working: makeRefinementComposition(concept(styleId)), original: concept(styleId),
    selectedIds, pointers: [], history: [], future: [],
  },
});

test('rotation angle normalisation handles wraparound and invalid inputs', () => {
  assert.equal(normaliseRefinementRotation(0), 0);
  assert.equal(normaliseRefinementRotation(90), 90);
  assert.equal(normaliseRefinementRotation(270), -90);
  assert.equal(normaliseRefinementRotation(-270), 90);
  assert.equal(normaliseRefinementRotation(540), 180);
  assert.equal(normaliseRefinementRotation(360), 0);
  assert.equal(normaliseRefinementRotation(''), 0);
  assert.equal(normaliseRefinementRotation(Number.NaN), 0);
});
test('drag angle is calculated around an object pivot and supports 15 degree snapping', () => {
  assert.equal(rotationPointerAngle(10, 0, 0, 0), 0);
  assert.equal(rotationPointerAngle(0, 10, 0, 0), 90);
  assert.equal(rotationFromPointer(10, 0, 77), 87);
  assert.equal(rotationFromPointer(10, 0, 77, true), 90);
  assert.equal(rotationFromPointer(175, 170, -170), -165);
});
test('single object rotates independently with one undo entry and redo', () => {
  const initial = project();
  const changed = editRefinement(initial, { key: 'rotation', id: 'name', value: 42 });
  assert.equal(changed.refinement.working.objects.name.rotation, 42);
  assert.equal(changed.refinement.working.objects.job.rotation, undefined);
  assert.equal(changed.refinement.history.length, 1);
  assert.equal(changed.refinement.original.id, initial.refinement.original.id);
  const undone = undoRefinement(changed);
  assert.equal(undone.refinement.working.objects.name.rotation, undefined);
  const redone = redoRefinement(undone);
  assert.equal(redone.refinement.working.objects.name.rotation, 42);
});
test('rotate selected elements together in one history step', () => {
  const initial = project('minimal', ['name', 'job', 'background']);
  const changed = editRefinement(initial, { key: 'rotationDelta', value: -15 });
  assert.equal(changed.refinement.working.objects.name.rotation, -15);
  assert.equal(changed.refinement.working.objects.job.rotation, -15);
  assert.equal(changed.refinement.working.objects.logo.rotation, undefined);
  assert.equal(changed.refinement.history.length, 1);
  const undone = undoRefinement(changed);
  assert.equal(undone.refinement.working.objects.name.rotation, undefined);
  assert.equal(undone.refinement.working.objects.job.rotation, undefined);
});
test('resetting a never-rotated object is a no-op, invalid rotation values are ignored', () => {
  const initial = project();
  assert.equal(editRefinement(initial, { key: 'rotation', value: 0 }), initial);
  assert.equal(editRefinement(initial, { key: 'rotation', value: NaN }), initial);
  assert.equal(editRefinement(initial, { key: 'rotation', value: '' }), initial);
});
test('rotation can be applied to symbols, dividers and decorative shapes', () => {
  for (const [styleId, kind] of [['minimal', 'mark'], ['botanical', 'decorations'], ['expressive', 'divider']]) {
    const initial = project(styleId, [kind]);
    const changed = editRefinement(initial, { key: 'rotation', value: 30 });
    assert.equal(changed.refinement.working.objects[kind].rotation, 30);
  }
});
test('duplicating an object preserves its angle, while copies rotate independently', () => {
  const rotated = editRefinement(project(), { key: 'rotation', value: 55 });
  const duplicated = editRefinement(rotated, { key: 'duplicate' });
  const copyId = duplicated.refinement.selectedIds[0];
  assert.equal(duplicated.refinement.working.objects[copyId].rotation, 55);
  const changedCopy = editRefinement(duplicated, { key: 'rotationDelta', value: 15 });
  assert.equal(changedCopy.refinement.working.objects[copyId].rotation, 70);
  assert.equal(changedCopy.refinement.working.objects.name.rotation, 55);
});
test('rotating after Undo clears future branch', () => {
  const first = editRefinement(project(), { key: 'rotation', value: 45 });
  const undone = undoRefinement(first);
  assert.equal(undone.refinement.future.length, 1);
  const branch = editRefinement(undone, { key: 'rotationDelta', value: -30 });
  assert.equal(branch.refinement.future.length, 0);
  assert.equal(redoRefinement(branch), branch);
});
test('pending conversational proposal blocks manual rotation', () => {
  const initial = project();
  const draft = { ...initial.refinement, promptDraft: 'Make the name larger', refinementMessages: [], nextRefinementMessageId: 1, pointers: [], toolMode: 'edit' };
  const proposed = proposeRefinementRequest(draft);
  assert.ok(proposed.pendingProposal);
  const locked = { ...initial, refinement: proposed };
  assert.equal(editRefinement(locked, { key: 'rotation', value: 90 }), locked);
});
test('export wraps rotated objects in SVG group about their correct pivot', () => {
  const initial = project();
  const changed = editRefinement(initial, { key: 'rotation', value: -30 });
  const svg = buildRefinementSvg(changed.refinement.working);
  assert.match(svg, /<g transform="rotate\(-30 35\.88 360\.094\)"><text /);
  assert.match(svg, /ALEX MORGAN/);
  assert.doesNotMatch(buildRefinementSvg(initial.refinement.working), /<g transform="rotate\(/);
});
test('SVG export rotates symbols, dividers and decorations while retaining original style', () => {
  for (const [styleId, id, pattern] of [
    ['minimal', 'mark', /<path/],
    ['botanical', 'decorations', /<path/],
    ['expressive', 'divider', /<line/],
  ]) {
    const result = editRefinement(project(styleId, [id]), { key: 'rotation', value: 45 });
    const svg = buildRefinementSvg(result.refinement.working);
    assert.match(svg, /<g transform="rotate\(45 /);
    assert.match(svg, pattern);
  }
});
test('original concept remains untouched by rotation', () => {
  const initial = project();
  const changed = editRefinement(initial, { key: 'rotationDelta', value: 45 });
  assert.deepEqual(changed.refinement.original, initial.refinement.original);
  assert.equal(initial.refinement.working.objects.name.rotation, undefined);
  assert.deepEqual(changed.messages, initial.messages);
});
