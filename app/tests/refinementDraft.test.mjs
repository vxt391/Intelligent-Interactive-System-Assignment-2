import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefinementDraft, enterRefinement, editRefinement, undoRefinement, redoRefinement, makeRefinementComposition, ensureMovableDesignDetails } from '../src/utils/refinementDraft.js';

const sample = {
  id: 'minimal-a', name: 'Modern Minimal', background: '#26374c',
  foreground: '#ffffff', accent: '#91aacc', brand: 'FORM /',
  styleId: 'minimal', typography: 'sans', role: 'DESIGN CONSULTANT',
};
function project(id = 1) {
  return {
    id, mode: 'explore', refinement: null,
    messages: [{ id: 4, role: 'recommendations', round: 1, concepts: [sample] }],
    exploration: { selectedConceptId: sample.id, selectedConceptMessageId: 4 },
    intentions: { preferences: [{ id: 'color-green', sentiment: 'avoid' }] },
    approvedDesign: null,
  };
}

test('provisional selected concept enters Refine without requiring approval', () => {
  const p = project(); const result = enterRefinement(p);
  assert.equal(result.mode, 'refine');
  assert.equal(result.refinement.source.conceptId, sample.id);
  assert.equal(result.approvedDesign, null);
  assert.deepEqual(result.messages, p.messages);
});
test('source concept is copied, never edited via refinement properties', () => {
  const p = enterRefinement(project());
  const selected = { ...p, refinement: { ...p.refinement, selectedIds: ['name'] } };
  const updated = editRefinement(selected, { key: 'text', value: 'IRIS SMITH' });
  assert.equal(updated.refinement.working.objects.name.text, 'IRIS SMITH');
  assert.equal(p.refinement.original.name, sample.name);
  assert.equal(p.messages[0].concepts[0], sample);
  assert.deepEqual(updated.intentions, p.intentions);
});
test('approved concept is supported even after provisional selection was cleared', () => {
  const p = project();
  p.exploration.selectedConceptId = null;
  p.approvedDesign = { concept: sample, conceptId: sample.id, messageId: 4 };
  const updated = enterRefinement(p, true);
  assert.equal(updated.refinement.source.approvedAtEntry, true);
  assert.equal(updated.refinement.original.id, sample.id);
});
test('opening refine again with the same source preserves working edits', () => {
  const p = enterRefinement(project());
  const changed = { ...p, refinement: { ...p.refinement, selectedIds: ['background'] } };
  const updated = editRefinement(changed, { key: 'background', value: '#ddffaa' });
  const again = enterRefinement({ ...updated, mode: 'explore' });
  assert.equal(again.refinement.working.background, '#ddffaa');
  assert.equal(again.refinement.history.length, 1);
});
test('multiple selection changes only chosen object colours', () => {
  const p = enterRefinement(project());
  const selected = { ...p, refinement: { ...p.refinement, selectedIds: ['name', 'job'] } };
  const updated = editRefinement(selected, { key: 'color', value: '#ff0000' });
  assert.equal(updated.refinement.working.objects.name.color, '#ff0000');
  assert.equal(updated.refinement.working.objects.job.color, '#ff0000');
  assert.equal(updated.refinement.working.objects.contact.color, '#ffffff');
});
test('undo restores working copy but not selected concept, approval, or preferences', () => {
  const p = enterRefinement(project());
  const selected = { ...p, refinement: { ...p.refinement, selectedIds: ['background'] } };
  const edited = editRefinement(selected, { key: 'background', value: '#ff0000' });
  const restored = undoRefinement(edited);
  assert.equal(restored.refinement.working.background, '#26374c');
  assert.deepEqual(restored.messages, p.messages);
  assert.deepEqual(restored.intentions, p.intentions);
  assert.equal(restored.refinement.history.length, 0);
});
test('refine without concept shows empty state rather than fabricating one', () => {
  const p = project(); p.messages = []; p.exploration.selectedConceptId = null;
  const updated = enterRefinement(p);
  assert.equal(updated.mode, 'refine');
  assert.equal(updated.refinement, null);
});
test('new selected source builds independent working copy, not previous source', () => {
  const p = enterRefinement(project());
  const other = { ...sample, id: 'new', name: 'Other Direction', background: '#ededed' };
  const changed = { ...p,
    messages: [...p.messages, { id: 5, role: 'recommendations', round: 2, concepts: [other] }],
    exploration: { selectedConceptId: 'new', selectedConceptMessageId: 5 } };
  const result = enterRefinement(changed);
  assert.equal(result.refinement.original.id, 'new');
  assert.equal(result.refinement.working.background, '#ededed');
  assert.equal(p.refinement.original.id, sample.id);
});
test('drag position updates one object and keeps other objects unchanged', () => {
  const p = enterRefinement(project());
  const updated = editRefinement(p, { key: 'position', id: 'name', value: { x: 43.14, y: 37.88 } });
  assert.equal(updated.refinement.working.objects.name.x, 43.1);
  assert.equal(updated.refinement.working.objects.name.y, 37.9);
  assert.deepEqual(updated.refinement.working.objects.job, p.refinement.working.objects.job);
  assert.equal(p.refinement.working.objects.name.x, 5.2);
  assert.deepEqual(updated.intentions, p.intentions);
});
test('drag position respects card bounds and is undoable', () => {
  const p = enterRefinement(project());
  const updated = editRefinement(p, { key: 'position', id: 'logo', value: { x: 400, y: -5 } });
  assert.equal(updated.refinement.working.objects.logo.x, 92);
  assert.equal(updated.refinement.working.objects.logo.y, 8);
  const back = undoRefinement(updated);
  assert.equal(back.refinement.working.objects.logo.x, 5.2);
  assert.equal(back.refinement.working.objects.logo.y, 16);
});

// Phase 4.2 zoom & redo UX regression coverage.

test('redo restores undone manual colour and maintains separate original', () => {
  const original = enterRefinement(project());
  const selected = { ...original, refinement: { ...original.refinement, selectedIds: ['name'] } };
  const edited = editRefinement(selected, { key: 'color', value: '#ff3344' });
  const undone = undoRefinement(edited);
  assert.equal(undone.refinement.working.objects.name.color, '#ffffff');
  assert.equal(undone.refinement.future.length, 1);
  const redone = redoRefinement(undone);
  assert.equal(redone.refinement.working.objects.name.color, '#ff3344');
  assert.equal(redone.refinement.future.length, 0);
  assert.equal(redone.refinement.history.length, 1);
  assert.deepEqual(redone.messages, original.messages);
  assert.deepEqual(redone.intentions, original.intentions);
});

test('multiple undo and redo walk history in both directions', () => {
  const selected = enterRefinement(project());
  const first = editRefinement(selected, { key: 'position', id: 'name', value: { x: 25, y: 46 } });
  const second = editRefinement(first, { key: 'position', id: 'name', value: { x: 45, y: 46 } });
  const backOne = undoRefinement(second);
  const backTwo = undoRefinement(backOne);
  assert.equal(backOne.refinement.working.objects.name.x, 25);
  assert.equal(backTwo.refinement.working.objects.name.x, 5.2);
  assert.equal(backTwo.refinement.future.length, 2);
  const nextOne = redoRefinement(backTwo);
  assert.equal(nextOne.refinement.working.objects.name.x, 25);
  const nextTwo = redoRefinement(nextOne);
  assert.equal(nextTwo.refinement.working.objects.name.x, 45);
  assert.equal(nextTwo.refinement.future.length, 0);
  assert.equal(redoRefinement(nextTwo), nextTwo);
});

test('new manual edit after undo clears redo history', () => {
  const selected = { ...enterRefinement(project()) };
  selected.refinement = { ...selected.refinement, selectedIds: ['name'] };
  const edited = editRefinement(selected, { key: 'size', value: 35 });
  const undone = undoRefinement(edited);
  const branch = editRefinement(undone, { key: 'size', value: 19 });
  assert.equal(branch.refinement.future.length, 0);
  assert.equal(redoRefinement(branch), branch);
  assert.equal(branch.refinement.working.objects.name.size, 19);
});

test('no-op property update does not clear redo', () => {
  const selected = { ...enterRefinement(project()) };
  selected.refinement = { ...selected.refinement, selectedIds: ['name'] };
  const edited = editRefinement(selected, { key: 'size', value: 35 });
  const undone = undoRefinement(edited);
  assert.equal(editRefinement(undone, { key: 'size', value: 24 }), undone);
  assert.equal(undone.refinement.future.length, 1);
});

test('view-only zoom survives undo/redo without entering edit history', () => {
  const base = enterRefinement(project());
  const withZoom = { ...base, refinement: { ...base.refinement, zoom: 150 } };
  const edited = editRefinement(withZoom, { key: 'position', id: 'name', value: { x: 28, y: 44 } });
  const undone = undoRefinement(edited);
  const redone = redoRefinement(undone);
  assert.equal(undone.refinement.zoom, 150);
  assert.equal(redone.refinement.zoom, 150);
  assert.equal(undone.refinement.history.length, 0);
  assert.equal(redone.refinement.working.objects.name.x, 28);
});

test('edit history is independent across projects', () => {
  const a = enterRefinement(project(1));
  const b = enterRefinement(project(2));
  const moved = editRefinement(a, { key: 'position', id: 'job', value: { x: 75, y: 37 } });
  assert.equal(b.refinement.history.length, 0);
  assert.equal(b.refinement.working.objects.job.x, 5.2);
  assert.equal(undoRefinement(b), b);
  assert.equal(redoRefinement(b), b);
  assert.equal(moved.refinement.working.objects.job.x, 75);
});


test('initial editable composition derives brand/mark/layout/colour directly from concept', () => {
  const working = makeRefinementComposition({ ...sample, layout: 'structured' });
  assert.equal(working.objects.logo.text, 'FORM /');
  assert.equal(working.brandMark, '◩');
  assert.equal(working.styleId, 'minimal');
  assert.equal(working.layout, 'structured');
  assert.equal(working.objects.logo.color, sample.foreground);
  assert.equal(working.objects.decorations.shape, 'stripe');
  assert.equal(working.objects.decorations.color, sample.accent);
  assert.equal(working.objects.contact.visible, false); // Original reference has no contact line.
});

test('each style and layout retains source template details', () => {
  const botanical = makeRefinementComposition({
    ...sample, styleId: 'botanical', brand: 'flora.', layout: 'spacious', typography: 'serif',
  });
  const expressive = makeRefinementComposition({
    ...sample, styleId: 'expressive', brand: 'bloom!', layout: 'dynamic', typography: 'serif',
  });
  assert.equal(botanical.objects.logo.text, 'flora.');
  assert.equal(botanical.brandMark, '✳');
  assert.equal(botanical.objects.decorations.shape, 'leaf');
  assert.equal(botanical.typography, 'serif');
  assert.equal(expressive.objects.decorations.shape, 'circle');
  assert.equal(expressive.brandMark, '✦');
  assert.equal(expressive.objects.name.x, 94.8);
  assert.equal(expressive.objects.job.x, 94.8);
  assert.equal(expressive.objects.contact.visible, false);
});

test('users can explicitly add contacts and Undo/Redo their visibility without altering source', () => {
  const initial = enterRefinement(project());
  const add = editRefinement(initial, { key: 'visibility', id: 'contact', value: true });
  assert.equal(add.refinement.working.objects.contact.visible, true);
  assert.equal(undoRefinement(add).refinement.working.objects.contact.visible, false);
  assert.equal(redoRefinement(undoRefinement(add)).refinement.working.objects.contact.visible, true);
  assert.deepEqual(add.refinement.original, initial.refinement.original);
});

test('original reference and selected concept survive manual edits and source switching', () => {
  const initial = enterRefinement(project());
  const changed = editRefinement(initial, { key: 'position', id: 'logo', value: { x: 35, y: 30 } });
  assert.deepEqual(initial.refinement.original, changed.refinement.original);
  assert.equal(initial.refinement.working.objects.logo.x, 5.2);
  const restored = enterRefinement({ ...changed, mode: 'explore' });
  assert.equal(restored.refinement.working.objects.logo.x, 35);
});

// 4.2 movable visual-detail regression: icons / dividers must not be fixed overlays.
test('each style exposes its top-right mark as a movable, selectable object', () => {
  for (const [styleId, mark] of [['minimal', '◩'], ['botanical', '✳'], ['expressive', '✦']]) {
    const working = makeRefinementComposition({ ...sample, styleId });
    assert.equal(working.objects.mark.text, mark);
    assert.equal(working.objects.mark.x, 94.8);
    assert.equal(working.objects.mark.y, 8.3);
    assert.equal(working.objects.mark.color, sample.foreground);
  }
});
test('structured divider is editable and absent in other layout types', () => {
  assert.ok(makeRefinementComposition({ ...sample, layout: 'structured' }).objects.divider);
  assert.equal(makeRefinementComposition({ ...sample, layout: 'spacious' }).objects.divider, undefined);
  assert.equal(makeRefinementComposition({ ...sample, layout: 'dynamic' }).objects.divider, undefined);
});
test('dragging the corner symbol changes only the working copy and supports Undo/Redo', () => {
  const original = enterRefinement(project());
  const moved = editRefinement(original, { key: 'position', id: 'mark', value: { x: 55, y: 38 } });
  assert.equal(moved.refinement.working.objects.mark.x, 55);
  assert.equal(moved.refinement.working.objects.mark.y, 38);
  assert.equal(moved.refinement.working.objects.logo.x, 5.2);
  assert.deepEqual(moved.refinement.original, original.refinement.original);
  assert.equal(undoRefinement(moved).refinement.working.objects.mark.x, 94.8);
  assert.equal(redoRefinement(undoRefinement(moved)).refinement.working.objects.mark.x, 55);
});
test('the divider line can be repositioned and its size altered', () => {
  const original = enterRefinement(project());
  const moved = editRefinement(original, { key: 'position', id: 'divider', value: { x: 10, y: 58 } });
  const selected = { ...moved, refinement: { ...moved.refinement, selectedIds: ['divider'] } };
  const resized = editRefinement(selected, { key: 'size', value: 480 });
  assert.equal(resized.refinement.working.objects.divider.x, 10);
  assert.equal(resized.refinement.working.objects.divider.y, 58);
  assert.equal(resized.refinement.working.objects.divider.size, 480);
  assert.equal(undoRefinement(resized).refinement.working.objects.divider.size, 618);
});
test('legacy drafts gain movable visual details without changing existing edits', () => {
  const original = enterRefinement(project());
  const legacy = structuredClone(original.refinement.working);
  delete legacy.objects.mark;
  delete legacy.objects.divider;
  legacy.objects.name.x = 44;
  const restored = ensureMovableDesignDetails(legacy);
  assert.equal(restored.objects.mark.text, '◩');
  assert.equal(restored.objects.divider.size, 618);
  assert.equal(restored.objects.name.x, 44);
  assert.equal(ensureMovableDesignDetails(restored), restored);
});
