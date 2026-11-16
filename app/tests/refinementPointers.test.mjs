import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefinementDraft } from '../src/utils/refinementDraft.js';
import {
  addRefinementPointer, removeRefinementPointer, clearRefinementPointers,
  recordRefinementRequest, normaliseCardPoint,
} from '../src/utils/refinementPointers.js';

const draft = () => ({
  working: { background: '#ffffff', objects: { name: { text: 'Ada', x: 9, y: 40 }, job: { text: 'Designer', x: 9, y: 60 } } },
  pointers: [], promptDraft: '', refinementMessages: [], nextPointerId: 1, nextRefinementMessageId: 1,
  toolMode: 'point', selectedIds: ['name'], referencesOpen: true, conversationOpen: true,
});

test('card locations are normalised and clamped', () => {
  assert.deepEqual(normaliseCardPoint(-10, 101.987), { x: 0, y: 100 });
  assert.deepEqual(normaliseCardPoint(31.24, 12.87), { x: 31.2, y: 12.9 });
});
test('pin on a known object records target and precise percentages', () => {
  const base = draft(); const next = addRefinementPointer(base, { x: 11.75, y: 42.29, objectId: 'name' });
  assert.deepEqual(next.pointers[0], { id: 'pointer-1', x: 11.8, y: 42.3, objectId: 'name', label: 'Name' });
  assert.equal(base.pointers.length, 0);
});
test('clicking a blank area associates the pointer with Background', () => {
  const next = addRefinementPointer(draft(), { x: 55, y: 50, objectId: 'background' });
  assert.equal(next.pointers[0].label, 'Background');
});
test('unrecognised DOM targets are conservatively handled as Background', () => {
  const next = addRefinementPointer(draft(), { x: 10, y: 10, objectId: 'imaginary-layer' });
  assert.equal(next.pointers[0].objectId, 'background');
});
test('many points may target the same object; IDs remain distinct', () => {
  const a = addRefinementPointer(draft(), { x: 12, y: 40, objectId: 'name' });
  const b = addRefinementPointer(a, { x: 15, y: 41, objectId: 'name' });
  assert.deepEqual(b.pointers.map(p => p.id), ['pointer-1', 'pointer-2']);
});
test('removing a pointer does not affect the other pointers or original draft', () => {
  const a = addRefinementPointer(addRefinementPointer(draft(), { x: 10, y: 10 }), { x: 20, y: 20 });
  const b = removeRefinementPointer(a, 'pointer-1');
  assert.equal(b.pointers[0].id, 'pointer-2');
  assert.equal(a.pointers.length, 2);
});
test('clear pointer removes annotations but preserves typed draft and working card', () => {
  const a = addRefinementPointer({ ...draft(), promptDraft: 'Move this' }, { x: 23, y: 45 });
  const b = clearRefinementPointers(a);
  assert.equal(b.promptDraft, 'Move this');
  assert.deepEqual(b.working, a.working);
  assert.equal(b.pointers.length, 0);
});
test('recording with two markers snapshots exact target identities in order', () => {
  const a = addRefinementPointer(addRefinementPointer(draft(), { x: 25, y: 40, objectId: 'name' }), { x: 30, y: 60, objectId: 'job' });
  const b = recordRefinementRequest({ ...a, promptDraft: ' Make these bigger. ' });
  assert.equal(b.refinementMessages.length, 1);
  assert.equal(b.refinementMessages[0].text, 'Make these bigger.');
  assert.deepEqual(b.refinementMessages[0].targets.map(t => [t.number, t.objectId]), [[1, 'name'], [2, 'job']]);
  assert.equal(b.refinementMessages[0].status, 'recorded');
  assert.equal(b.pointers.length, 0);
  assert.equal(b.promptDraft, '');
  assert.equal(a.pointers.length, 2);
});
test('general requests may be recorded honestly with no pointer targets', () => {
  const b = recordRefinementRequest({ ...draft(), promptDraft: 'Try a cleaner overall look.' });
  assert.deepEqual(b.refinementMessages[0].targets, []);
});
test('empty text is never submitted', () => {
  const a = { ...draft(), promptDraft: '  \n ' };
  assert.equal(recordRefinementRequest(a), a);
});
test('new request retains old history and stable pointer IDs after clearing', () => {
  const a = addRefinementPointer({ ...draft(), promptDraft: 'First' }, { x: 10, y: 10 });
  const b = recordRefinementRequest(a);
  const c = addRefinementPointer({ ...b, promptDraft: 'Second' }, { x: 30, y: 30 });
  const d = recordRefinementRequest(c);
  assert.deepEqual(d.refinementMessages.map(m => m.id), ['request-1', 'request-2']);
  assert.deepEqual(d.refinementMessages.map(m => m.targets[0].pointerId), ['pointer-1', 'pointer-2']);
});
test('requests never modify working design or editing selection', () => {
  const a = addRefinementPointer({ ...draft(), promptDraft: 'Change the name' }, { x: 20, y: 35, objectId: 'name' });
  const b = recordRefinementRequest(a);
  assert.deepEqual(b.working, a.working);
  assert.deepEqual(b.selectedIds, a.selectedIds);
  assert.equal(b.conversationOpen, true);
});
test('Edit-mode selected objects can target a request without placing pins', () => {
  const a = { ...draft(), toolMode: 'edit', promptDraft: 'Make the name bigger', pointers: [] };
  const b = recordRefinementRequest(a);
  assert.equal(b.refinementMessages[0].targets.length, 1);
  assert.equal(b.refinementMessages[0].targets[0].objectId, 'name');
  assert.equal(b.refinementMessages[0].targets[0].pointerId, 'object-name');
});
test('explicit spatial pins take precedence over old object selection', () => {
  const a = addRefinementPointer({ ...draft(), toolMode: 'edit', promptDraft: 'Change this area' }, { x: 50, y: 50, objectId: 'background' });
  const b = recordRefinementRequest(a);
  assert.deepEqual(b.refinementMessages[0].targets.map(t => t.objectId), ['background']);
});

test('corner symbols and divider are separate point-and-describe targets', () => {
  const source = createRefinementDraft({ concept: { id: 'minimal-pointer', name: 'Modern Minimal', styleId: 'minimal', layout: 'structured', brand: 'FORM /' }, messageId: 2, approved: false });
  const marked = addRefinementPointer(source, { x: 92, y: 10, objectId: 'mark' });
  const twice = addRefinementPointer(marked, { x: 50, y: 74, objectId: 'divider' });
  assert.equal(twice.pointers[0].label, 'Brand symbol');
  assert.equal(twice.pointers[1].label, 'Divider line');
});
