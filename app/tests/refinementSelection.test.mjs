import test from 'node:test';
import assert from 'node:assert/strict';
import { deselectRefinementOnBoard } from '../src/utils/refinementSelection.js';

const draft = () => ({
  toolMode: 'edit', selectedIds: ['name', 'mark'], pointers: [{ id: 'p1', x: 30, y: 40 }],
  working: { objects: { name: { x: 10 } } },
  promptDraft: 'move left', refinementMessages: [{ id: 7 }], pendingProposal: null,
});

test('blank canvas click clears all selected objects', () => {
  const before = draft();
  const after = deselectRefinementOnBoard(before);
  assert.deepEqual(after.selectedIds, []);
  assert.deepEqual(before.selectedIds, ['name', 'mark']);
});
test('clearing selection preserves pointers, artwork and conversation history', () => {
  const before = draft();
  const after = deselectRefinementOnBoard(before);
  assert.equal(after.working, before.working);
  assert.equal(after.pointers, before.pointers);
  assert.equal(after.refinementMessages, before.refinementMessages);
  assert.equal(after.promptDraft, before.promptDraft);
});
test('Point mode does not clear selections or pointer targets', () => {
  const before = { ...draft(), toolMode: 'point' };
  assert.equal(deselectRefinementOnBoard(before), before);
});
test('pending proposal does not clear selection', () => {
  const before = { ...draft(), pendingProposal: { messageId: 'new' } };
  assert.equal(deselectRefinementOnBoard(before), before);
});
test('no selection is a no-op; background selection is cleared normally', () => {
  const empty = { ...draft(), selectedIds: [] };
  assert.equal(deselectRefinementOnBoard(empty), empty);
  const selected = { ...draft(), selectedIds: ['background'] };
  assert.deepEqual(deselectRefinementOnBoard(selected).selectedIds, []);
});
