import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommunitySuggestionTracker } from '../src/utils/communitySuggestionRules.js';
import {
  trackAndOfferCommunitySuggestion as record,
  resolveCommunitySuggestion,
  markActiveCommunitySuggestionsUsed,
} from '../src/utils/communitySuggestionWorkflow.js';

function project(id = 1) {
  return { id, messages: [], nextMessageId: 1,
    intentions: { preferences: [{ id: 'serif', sentiment: 'like' }] },
    exploration: { communitySuggestionTracker: createCommunitySuggestionTracker() } };
}
const say = (n, text) => ({eventKey: `message:${n}`, action: 'message', text});
const explore = (n, action = 'new-directions') => ({eventKey: `${action}:${n}`, action});
function offer(p) {
  return record(record(p, say(1, "I'm not sure what I want")),
    say(2, "I don't like any of these designs"));
}
test('first eligible sequence creates exactly one actionable inline message', () => {
  const p = offer(project());
  assert.equal(p.messages.length, 1);
  assert.equal(p.messages[0].role, 'community-suggestion');
  assert.equal(p.messages[0].status, 'active');
  assert.equal(p.messages[0].id, 1);
  assert.equal(p.nextMessageId, 2);
  assert.equal(p.exploration.communitySuggestionTracker.pending, false);
  assert.equal(p.exploration.communitySuggestionTracker.suggestedCount, 1);
});
test('regular new-directions and narrow feedback do not offer suggestion', () => {
  let p = record(project(), say(1, 'I do not like green'));
  p = record(p, explore(2, 'feedback'));
  p = record(p, explore(3));
  assert.equal(p.messages.length, 0);
});
test('one active actionable suggestion maximum, even after more interactions', () => {
  const before = offer(project());
  const p = record(record(record(before, say(3, 'I cannot decide')),
    say(4, 'None of these designs work')), explore(5));
  assert.equal(p.messages.length, 1);
  assert.equal(p.exploration.communitySuggestionTracker.suggestedCount, 1);
});
test('Keep Designing makes history noninteractive, preserving project data', () => {
  const before = offer(project());
  const after = resolveCommunitySuggestion(before, 1, 'dismissed');
  assert.equal(after.messages[0].status, 'dismissed');
  assert.equal(after.intentions, before.intentions);
  assert.equal(after.exploration, before.exploration);
  assert.equal(resolveCommunitySuggestion(after, 1, 'used'), after);
});
test('Explore Community marks used, never changes other project state', () => {
  const p = offer(project(1));
  const other = project(2);
  const updated = [p,other].map(x => x.id===1?resolveCommunitySuggestion(x,1,'used'):x);
  assert.equal(updated[0].messages[0].status,'used');
  assert.equal(updated[1],other);
});
test('sidebar visit marks active suggestion used and is idempotent', () => {
  const p = offer(project());
  const marked = markActiveCommunitySuggestionsUsed(p);
  assert.equal(marked.messages[0].status, 'used');
  assert.equal(markActiveCommunitySuggestionsUsed(marked), marked);
});
test('another suggestion needs three fresh relevant interactions and two fresh signals', () => {
  let p = resolveCommunitySuggestion(offer(project()),1,'dismissed');
  p = record(p,say(3,'I cannot decide'));
  p = record(p,say(4,'None of these designs work'));
  assert.equal(p.messages.length,1);
  p = record(p,explore(5,'variations'));
  assert.equal(p.messages.length,2);
  assert.equal(p.messages[1].id,2);
  assert.equal(p.messages[1].status,'active');
  assert.equal(p.exploration.communitySuggestionTracker.suggestedCount,2);
});
test('a user action is never required or performed by the rule detector to navigate', () => {
  const p = offer(project());
  assert.equal(Object.hasOwn(p,'activeWorkspace'),false);
  assert.equal(p.messages[0].role,'community-suggestion');
});
test('completed suggestion remains in history when a new active one appears', () => {
  let p = resolveCommunitySuggestion(offer(project()),1,'used');
  p = record(p,say(3,'I cannot decide'));
  p = record(p,explore(4));
  p = record(p,say(5,'None of these designs work'));
  assert.deepEqual(p.messages.map(m=>m.status),['used','active']);
});
test('duplicate event keys do not duplicate suggestion messages', () => {
  let p = record(project(),say(1,'I cannot decide'));
  p = record(p,say(1,'I cannot decide'));
  assert.equal(p.messages.length,0);
  p = record(p,say(2,'None of these designs work'));
  assert.equal(p.messages.length,1);
});
