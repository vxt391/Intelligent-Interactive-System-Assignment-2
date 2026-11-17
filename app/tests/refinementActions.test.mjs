import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefinementDraft, editRefinement, undoRefinement, redoRefinement, refinementObjectKind } from '../src/utils/refinementDraft.js';
import { addRefinementPointer, recordRefinementRequest, refinementObjectLabel } from '../src/utils/refinementPointers.js';
import { planRefinementChange, proposeRefinementRequest, acceptRefinementProposal } from '../src/utils/refinementChanges.js';

const makeProject = () => ({
  name: 'Test Project',
  messages: [], intentions: { preferences: [] }, approvedDesign: { concept: { id: 'base' } },
  refinement: createRefinementDraft({ concept: { id: 'min', brand: 'FORM /', role: 'DESIGNER', styleId: 'minimal', layout: 'structured' }, messageId: 2, approved: false }),
});
const select = (p, ...ids) => ({ ...p, refinement: { ...p.refinement, selectedIds: ids } });

test('delete selected text hides it, does not affect original and is one Undo step', () => {
  const p = select(makeProject(), 'name');
  const deleted = editRefinement(p, { key: 'delete' });
  assert.equal(deleted.refinement.working.objects.name.visible, false);
  assert.deepEqual(deleted.refinement.selectedIds, []);
  assert.equal(deleted.refinement.history.length, 1);
  assert.deepEqual(deleted.refinement.original, p.refinement.original);
  assert.deepEqual(deleted.approvedDesign, p.approvedDesign);
  const restored = undoRefinement(deleted);
  assert.equal(restored.refinement.working.objects.name.visible, undefined);
  assert.deepEqual(restored.refinement.selectedIds, ['name']);
  assert.equal(redoRefinement(restored).refinement.working.objects.name.visible, false);
});

test('delete multiple objects is atomic and protects background', () => {
  const p = select(makeProject(), 'background', 'name', 'mark', 'divider');
  const deleted = editRefinement(p, { key: 'delete' });
  assert.equal(deleted.refinement.working.objects.name.visible, false);
  assert.equal(deleted.refinement.working.objects.mark.visible, false);
  assert.equal(deleted.refinement.working.objects.divider.visible, false);
  assert.ok(deleted.refinement.working.background);
  assert.equal(deleted.refinement.history.length, 1);
  const restored = undoRefinement(deleted);
  assert.equal(restored.refinement.working.objects.mark.visible, undefined);
  assert.equal(restored.refinement.working.objects.divider.visible, undefined);
});

test('background alone cannot be deleted or duplicated', () => {
  const p = select(makeProject(), 'background');
  assert.equal(editRefinement(p, { key: 'delete' }), p);
  assert.equal(editRefinement(p, { key: 'duplicate' }), p);
});

test('multi-selection duplicate creates independent offset objects and selects only copies', () => {
  const p = select(makeProject(), 'name', 'job');
  const done = editRefinement(p, { key: 'duplicate' });
  assert.deepEqual(done.refinement.selectedIds, ['name-copy-1', 'job-copy-1']);
  const copy = done.refinement.working.objects['name-copy-1'];
  assert.equal(copy.kind, 'name');
  assert.equal(copy.text, p.refinement.working.objects.name.text);
  assert.equal(copy.x, p.refinement.working.objects.name.x + 4);
  assert.equal(copy.y, p.refinement.working.objects.name.y + 4);
  assert.equal(done.refinement.working.objects.name.x, p.refinement.working.objects.name.x);
  assert.equal(done.refinement.history.length, 1);
});

test('duplicates can be edited independently and dragged', () => {
  const copied = editRefinement(select(makeProject(), 'name'), { key: 'duplicate' });
  const changed = editRefinement(copied, { key: 'text', value: 'SOMETHING ELSE' });
  assert.equal(changed.refinement.working.objects['name-copy-1'].text, 'SOMETHING ELSE');
  assert.equal(changed.refinement.working.objects.name.text, 'ALEX MORGAN');
  const dragged = editRefinement(changed, { key: 'position', id: 'name-copy-1', value: { x: 34, y: 25 } });
  assert.equal(dragged.refinement.working.objects['name-copy-1'].x, 34);
  assert.equal(dragged.refinement.working.objects.name.x, 5.2);
});

test('duplicate-to-duplicate gets a new identity without overwriting existing objects', () => {
  const once = editRefinement(select(makeProject(), 'mark'), { key: 'duplicate' });
  const twice = editRefinement(once, { key: 'duplicate' });
  assert.ok(twice.refinement.working.objects['mark-copy-1']);
  assert.ok(twice.refinement.working.objects['mark-copy-2']);
  assert.equal(refinementObjectKind('mark-copy-2', twice.refinement.working.objects['mark-copy-2']), 'mark');
  assert.equal(twice.refinement.working.objects.mark.text, '◩');
});

test('delete clone removes it without hiding its source', () => {
  const once = editRefinement(select(makeProject(), 'mark'), { key: 'duplicate' });
  const deleted = editRefinement(once, { key: 'delete' });
  assert.equal(deleted.refinement.working.objects['mark-copy-1'], undefined);
  assert.ok(deleted.refinement.working.objects.mark);
  assert.ok(undoRefinement(deleted).refinement.working.objects['mark-copy-1']);
});

test('redo restores duplicate and selected IDs (does not reference missing objects)', () => {
  const p = select(makeProject(), 'name');
  const copied = editRefinement(p, { key: 'duplicate' });
  const undone = undoRefinement(copied);
  assert.equal(undone.refinement.working.objects['name-copy-1'], undefined);
  assert.deepEqual(undone.refinement.selectedIds, ['name']);
  const redone = redoRefinement(undone);
  assert.ok(redone.refinement.working.objects['name-copy-1']);
  assert.deepEqual(redone.refinement.selectedIds, ['name-copy-1']);
});

test('new duplicate after undo clears redo branch', () => {
  const once = editRefinement(select(makeProject(), 'name'), { key: 'duplicate' });
  const undone = undoRefinement(once);
  const branch = editRefinement(undone, { key: 'duplicate' });
  assert.equal(branch.refinement.future.length, 0);
  assert.equal(redoRefinement(branch), branch);
});

test('pointer labels and conversation requests distinguish duplicates', () => {
  const copied = editRefinement(select(makeProject(), 'name'), { key: 'duplicate' });
  assert.equal(refinementObjectLabel('name-copy-1', copied.refinement.working.objects), 'Name copy 1');
  const pinned = addRefinementPointer(copied.refinement, { objectId: 'name-copy-1', x: 20, y: 40 });
  assert.equal(pinned.pointers[0].label, 'Name copy 1');
  const recorded = recordRefinementRequest({ ...pinned, promptDraft: 'Move down' });
  assert.equal(recorded.refinementMessages[0].targets[0].objectId, 'name-copy-1');
  assert.equal(recorded.refinementMessages[0].targets[0].label, 'Name copy 1');
});

test('conversational edits target duplicate independently of original', () => {
  const copied = editRefinement(select(makeProject(), 'mark'), { key: 'duplicate' });
  const proposal = planRefinementChange(copied.refinement.working, 'Move slightly left and make bigger', [{ objectId: 'mark-copy-1' }]);
  assert.equal(proposal.ok, true);
  assert.equal(proposal.working.objects.mark.x, copied.refinement.working.objects.mark.x);
  assert.notEqual(proposal.working.objects['mark-copy-1'].x, copied.refinement.working.objects['mark-copy-1'].x);
});

test('delete cleans up stale pointers and undo restores them', () => {
  const p = select(makeProject(), 'name');
  const pinned = addRefinementPointer(p.refinement, { objectId: 'name', x: 22, y: 40 });
  const deleted = editRefinement({ ...p, refinement: pinned }, { key: 'delete' });
  assert.deepEqual(deleted.refinement.pointers, []);
  assert.equal(undoRefinement(deleted).refinement.pointers[0].objectId, 'name');
});

test('pending proposals disable destructive and duplicating actions', () => {
  const p = select(makeProject(), 'name');
  const proposed = proposeRefinementRequest({ ...p.refinement, promptDraft: 'Make larger' });
  const locked = { ...p, refinement: proposed };
  assert.ok(proposed.pendingProposal);
  assert.equal(editRefinement(locked, { key: 'delete' }), locked);
  assert.equal(editRefinement(locked, { key: 'duplicate' }), locked);
  assert.ok(acceptRefinementProposal(proposed).working.objects.name.size > p.refinement.working.objects.name.size);
});
