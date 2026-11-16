import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyCommunitySignal,
  createCommunitySuggestionTracker,
  recordCommunityInteraction,
  markCommunitySuggestionShown,
  resetCommunityObservation,
  trackProjectCommunityInteraction,
} from '../src/utils/communitySuggestionRules.js';

const message = (n, text) => ({ eventKey: `message:${n}`, action: 'message', text });
const neutral = (n, action = 'new-directions') => ({ eventKey: `${action}:${n}`, action });
const feed = (tracker, ...events) => events.reduce(recordCommunityInteraction, tracker);
const blank = () => createCommunitySuggestionTracker();

// Source-language recognition is intentionally conservative. The prototype
// does not infer a psychological or emotional state.
test('recognises broad uncertainty and rejection in submitted design messages', () => {
  for (const text of [
    "I'm not sure what I want for my business card",
    'I do not know which direction to take',
    "I can't decide",
    'No clear design direction yet',
    "I'm struggling with the design style",
  ]) assert.equal(classifyCommunitySignal(text), 'uncertainty', text);
  for (const text of [
    "I still don't like any of these directions",
    'None of these designs work for me',
    'None of these work',
    'All these concepts feel wrong',
    'I reject all these designs',
  ]) assert.equal(classifyCommunitySignal(text), 'broad-rejection', text);
});

test('ignores narrow negative feedback and normal design instructions', () => {
  for (const text of [
    'I do not like green', 'Avoid sans-serif', 'Please make the logo smaller',
    'I am not sure about the typography', 'I am uncertain about the font', 'Please explore new directions',
    'Try more blue variations', 'I dislike this layout',
    'Can you make a business card with a simple grid?',
  ]) assert.equal(classifyCommunitySignal(text), null, text);
});

test('a single signal does not trigger; two signals within three do', () => {
  let t = feed(blank(), message(1, "I'm not sure what I want"));
  assert.equal(t.pending, false);
  t = feed(t, neutral(2), message(3, 'None of these designs work'));
  assert.equal(t.pending, true);
  assert.equal(t.recent.length, 3);
  assert.equal(t.recent.filter(x => x.signal).length, 2);
});

test('two consecutive meaningful messages are enough for the initial suggestion', () => {
  const t = feed(blank(), message(1, 'I cannot decide'), message(2, "I don't like any of these designs"));
  assert.equal(t.pending, true);
  assert.equal(t.observedSinceSuggestion, 2);
});

test('rolling last-three window drops old signals', () => {
  const t = feed(blank(), message(1, 'I cannot decide'), neutral(2), neutral(3), neutral(4));
  assert.equal(t.pending, false);
  assert.equal(t.recent.length, 3);
  assert.equal(t.recent.some(e => e.signal), false);
});

test('ordinary feedback, variations, and new directions are neutral even with Avoid', () => {
  const t = feed(blank(), neutral(1,'feedback'), neutral(2,'variations'), neutral(3,'new-directions'));
  assert.equal(t.pending, false);
  assert.deepEqual(t.recent.map(e=>e.signal), [null,null,null]);
});

test('multiple uncertainty cues in one submitted message count only once', () => {
  const t = feed(blank(), message(1, "I'm not sure what I want and I can't decide"));
  assert.equal(t.recent.length, 1);
  assert.equal(t.pending, false);
});

test('repeating the same event key does not double-count it', () => {
  const before = feed(blank(), message(1, "I'm not sure what I want"));
  const after = recordCommunityInteraction(before, message(1, 'None of these designs work'));
  assert.deepEqual(after, before);
});

test('pending eligibility is latched until a suggestion is actually shown', () => {
  const t = feed(blank(), message(1, 'I cannot decide'), message(2, "I don't like any of these designs"));
  const after = recordCommunityInteraction(t, neutral(3));
  assert.deepEqual(after,t);
  assert.equal(after.suggestedCount,0);
});

test('shown suggestion clears old signals; two fresh signals alone cannot re-trigger', () => {
  const initially = feed(blank(), message(1, 'I cannot decide'), message(2, "I don't like any of these designs"));
  const shown = markCommunitySuggestionShown(initially);
  assert.equal(shown.suggestedCount,1);
  assert.equal(shown.pending,false);
  assert.equal(shown.recent.length,0);
  let t = feed(shown, message(3, 'I do not know what I want'), message(4, "None of these designs work"));
  assert.equal(t.pending,false);
  t = feed(t, neutral(5,'variations'));
  assert.equal(t.pending,true);
});

test('after showing, three fresh interactions with only one signal do not retrigger', () => {
  const shown=markCommunitySuggestionShown(feed(blank(), message(1,'I cannot decide'),message(2,'None of these designs work')));
  const t=feed(shown, message(3,'I do not know what I want'),neutral(4),neutral(5));
  assert.equal(t.pending,false);
});

test('marking shown without eligibility does nothing', () => {
  const t = blank();
  assert.deepEqual(markCommunitySuggestionShown(t),t);
});

test('completion reset clears observation but keeps prior suggestion count', () => {
  const shown = markCommunitySuggestionShown(feed(blank(),message(1,'I cannot decide'),message(2,'None of these designs work')));
  const reset = resetCommunityObservation(feed(shown,message(3,"I'm not sure what I want")));
  assert.equal(reset.recent.length,0);
  assert.equal(reset.pending,false);
  assert.equal(reset.suggestedCount,1);
});

test('tracking project A never modifies B or existing preferences/brief/history', () => {
  const a={id:1,exploration:{round:2,communitySuggestionTracker:blank()},
    intentions:{preferences:[{id:'blue',sentiment:'like'}]},messages:[{id:1,role:'recommendations'}]};
  const b={id:2,exploration:{round:3,communitySuggestionTracker:blank()},
    intentions:{preferences:[]}, messages:[]};
  const initial=[a,b];
  const updated=initial.map(p=>p.id===1?trackProjectCommunityInteraction(p,message(1,'I cannot decide')):p);
  assert.equal(updated[1],b);
  assert.equal(updated[0].messages,a.messages);
  assert.equal(updated[0].intentions,a.intentions);
  assert.equal(updated[0].exploration.round,2);
  assert.equal(updated[0].exploration.communitySuggestionTracker.recent.length,1);
  assert.equal(a.exploration.communitySuggestionTracker.recent.length,0);
});

test('tracker saves categories but never duplicates full user message content', () => {
  const privatePhrase='I cannot decide on my confidential business card details';
  const t=feed(blank(),message(1,privatePhrase));
  assert.equal(JSON.stringify(t).includes(privatePhrase),false);
  assert.equal(t.recent[0].signal,'uncertainty');
});

test('unknown actions and invalid events do not count', () => {
  const t=blank();
  assert.equal(recordCommunityInteraction(t,{eventKey:'x',action:'navigation'}),t);
  assert.equal(recordCommunityInteraction(t,{action:'message',text:'I cannot decide'}),t);
  assert.equal(recordCommunityInteraction(t,null),t);
});
