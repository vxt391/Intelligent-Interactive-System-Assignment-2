import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefinementDraft, enterRefinement, editRefinement, undoRefinement } from '../src/utils/refinementDraft.js';

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
