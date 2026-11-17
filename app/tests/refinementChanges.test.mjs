import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractRefinementOperations, planRefinementChange,
  proposeRefinementRequest, acceptRefinementProposal, rejectRefinementProposal,
} from '../src/utils/refinementChanges.js';
import { createRefinementDraft, undoRefinement, redoRefinement } from '../src/utils/refinementDraft.js';
import { addRefinementPointer } from '../src/utils/refinementPointers.js';

const concept = { id: 'minimal-a', name: 'Modern Minimal', background: '#f6f7f8', foreground:'#26374c', accent:'#c1aabb', brand:'FORM /', role:'DESIGNER', styleId:'minimal', layout:'structured' };
const initial = () => createRefinementDraft({ concept, messageId: 3, approved: false });
const choose = (text, ids = ['name']) => ({ ...initial(), selectedIds: ids, promptDraft: text });

test('parses colour, size and move together without an LLM', () => {
  const { operations, error } = extractRefinementOperations('Make these elements larger, move them slightly down and turn them dark blue');
  assert.equal(error, null);
  assert.deepEqual(operations.map(o=>o.type), ['color','size','move']);
  assert.equal(operations[0].value, '#17365d');
  assert.equal(operations[2].dy, 3);
});
test('a hex colour is supported', () => {
  const plan = planRefinementChange(initial().working, 'Change colour to #Ff0088', [{objectId:'name'}]);
  assert.equal(plan.ok, true); assert.equal(plan.working.objects.name.color.toLowerCase(), '#ff0088');
});
test('an instruction with no supported edit is not reported as success', () => {
  assert.equal(planRefinementChange(initial().working,'Make it more beautiful',[{objectId:'name'}]).ok, false);
});
test('ambiguous or unsupported mixed instructions are refused without partial edits', () => {
  for(const text of ['Make the name larger and add a new photograph', 'Move left and right', 'Move it somewhere', 'Make it bigger and smaller', 'Make the name italic and blue']) {
    assert.equal(planRefinementChange(initial().working,text,[{objectId:'name'}]).ok, false, text);
  }
});
test('no targets returns clear failure rather than editing everything', () => {
  const proposal = proposeRefinementRequest({ ...initial(), promptDraft:'Make it larger' });
  assert.equal(proposal.pendingProposal, null);
  assert.equal(proposal.refinementMessages.at(-1).status, 'unsupported');
  assert.match(proposal.refinementMessages.at(-1).explanation, /select/i);
});
test('multi-selected name and job change independently of logo', () => {
  const draft = choose('Make both text elements dark blue and larger', ['name','job']);
  const preview = proposeRefinementRequest(draft);
  assert.equal(preview.refinementMessages.at(-1).targets.length, 2);
  assert.equal(preview.pendingProposal.working.objects.name.color, '#17365d');
  assert.equal(preview.pendingProposal.working.objects.job.color, '#17365d');
  assert.equal(preview.working.objects.name.color, draft.working.objects.name.color);
  assert.deepEqual(preview.working.objects.logo, draft.working.objects.logo);
});
test('a pointer on a known object determines the edit target', () => {
  let draft = initial(); draft = addRefinementPointer(draft, { x:34, y:46, objectId:'mark' });
  draft = { ...draft, promptDraft:'Move it to the left' };
  const preview = proposeRefinementRequest(draft);
  assert.equal(preview.refinementMessages.at(-1).targets[0].objectId, 'mark');
  assert.equal(preview.refinementMessages.at(-1).targets[0].x, 34);
  assert.ok(preview.pendingProposal.working.objects.mark.x < draft.working.objects.mark.x);
});
test('a pointer on empty space can change background colour', () => {
  let draft = addRefinementPointer(initial(), { x: 40, y:45, objectId:'background' });
  const preview = proposeRefinementRequest({ ...draft, promptDraft:'Make the background black' });
  assert.equal(preview.pendingProposal.working.background, '#111111');
  assert.equal(preview.working.background, draft.working.background);
});
test('a pointer on background cannot move or resize the artboard', () => {
  const working = initial().working;
  for (const text of ['Move down','Make it bigger']) {
    assert.equal(planRefinementChange(working,text,[{objectId:'background'}]).ok,false);
  }
});
test('a mixed background and name selection cannot partially apply a size change', () => {
  const preview = proposeRefinementRequest(choose('Make both larger',['background','name']));
  assert.equal(preview.pendingProposal,null);
  assert.equal(preview.refinementMessages.at(-1).status,'unsupported');
});
test('submission alone never touches the actual working design', () => {
  const draft = choose('Make the name bigger');
  const preview = proposeRefinementRequest(draft);
  assert.deepEqual(preview.working, draft.working);
  assert.equal(preview.history.length,0);
  assert.equal(preview.refinementMessages.at(-1).status,'proposed');
  assert.equal(preview.previewVisible,true);
});
test('reject keeps working design and history intact', () => {
  const draft = choose('Make the name bigger');
  const proposal = proposeRefinementRequest(draft);
  const rejected = rejectRefinementProposal(proposal);
  assert.deepEqual(rejected.working, draft.working);
  assert.deepEqual(rejected.history, draft.history);
  assert.equal(rejected.refinementMessages.at(-1).status,'rejected');
  assert.equal(rejected.pendingProposal,null);
});
test('accept commits one history snapshot and supports undo redo', () => {
  const draft = choose('Make the name larger and move it down');
  const preview = proposeRefinementRequest(draft);
  const accepted = acceptRefinementProposal(preview);
  assert.equal(accepted.refinementMessages.at(-1).status,'accepted');
  assert.equal(accepted.history.length,1);
  assert.deepEqual(accepted.working,preview.pendingProposal.working);
  assert.equal(accepted.pendingProposal,null);
  const undone = undoRefinement({refinement:accepted}).refinement;
  assert.deepEqual(undone.working, draft.working);
  const redone = redoRefinement({refinement:undone}).refinement;
  assert.deepEqual(redone.working, accepted.working);
});
test('accept clears a redo branch', () => {
  const draft = { ...choose('Make the name bigger'), future:[{working:initial().working}] };
  const accepted = acceptRefinementProposal(proposeRefinementRequest(draft));
  assert.deepEqual(accepted.future, []);
});
test('cannot submit a second proposal while one is pending', () => {
  const pending = proposeRefinementRequest(choose('Make the name bigger'));
  const attempted = { ...pending, promptDraft: 'Move the name down' };
  assert.equal(proposeRefinementRequest(attempted), attempted);
});
test('accepting twice or rejecting twice makes no further edits', () => {
  const proposal = proposeRefinementRequest(choose('Make the name bigger'));
  const accepted = acceptRefinementProposal(proposal);
  assert.equal(acceptRefinementProposal(accepted),accepted);
  const rejected = rejectRefinementProposal(proposal);
  assert.equal(rejectRefinementProposal(rejected),rejected);
});
test('a no-op at position boundary is explained', () => {
  const working = initial().working;
  working.objects.name.x=92;
  const result = planRefinementChange(working,'Move right',[{objectId:'name'}]);
  assert.equal(result.ok,false);
  assert.match(result.reason,/not alter/i);
});
test('original concept and pointer target record do not change after approval', () => {
  const draft = addRefinementPointer(initial(), {x:19,y:85,objectId:'name'});
  const accepted = acceptRefinementProposal(proposeRefinementRequest({...draft,promptDraft:'Make the name larger'}));
  assert.deepEqual(accepted.original,concept);
  assert.equal(accepted.refinementMessages[0].targets[0].x,19);
  assert.deepEqual(accepted.pointers,[]);
});
