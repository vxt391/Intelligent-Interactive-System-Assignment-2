import assert from 'node:assert/strict';
import test from 'node:test';
import { keyboardObjectNudge } from '../src/utils/refinementKeyboard.js';

const obj = { x: 40, y: 30 };
const event = (key, modifiers = {}) => ({ key, ...modifiers });

test('each arrow nudges only its axis by 1 percent', () => {
  assert.deepEqual(keyboardObjectNudge(obj, event('ArrowUp')), { x: 40, y: 29 });
  assert.deepEqual(keyboardObjectNudge(obj, event('ArrowDown')), { x: 40, y: 31 });
  assert.deepEqual(keyboardObjectNudge(obj, event('ArrowLeft')), { x: 39, y: 30 });
  assert.deepEqual(keyboardObjectNudge(obj, event('ArrowRight')), { x: 41, y: 30 });
});
test('Shift uses 5 percent increments', () => {
  assert.deepEqual(keyboardObjectNudge(obj, event('ArrowRight', { shiftKey: true })), { x: 45, y: 30 });
  assert.deepEqual(keyboardObjectNudge(obj, event('ArrowUp', { shiftKey: true })), { x: 40, y: 25 });
});
test('matches drag boundary constraints', () => {
  assert.deepEqual(keyboardObjectNudge({ x: 91, y: 8 }, event('ArrowRight', { shiftKey: true })), { x: 92, y: 8 });
  assert.deepEqual(keyboardObjectNudge({ x: 96, y: 8 }, event('ArrowRight', { shiftKey: true }), 'mark'), { x: 98, y: 8 });
  assert.equal(keyboardObjectNudge({ x: 2, y: 8 }, event('ArrowLeft')), null);
  assert.equal(keyboardObjectNudge({ x: 50, y: 92 }, event('ArrowDown')), null);
});
test('unrelated keys and Ctrl/Alt/Meta combinations are not intercepted', () => {
  for (const key of ['Enter', 'Escape', 'Tab', ' ']) assert.equal(keyboardObjectNudge(obj, event(key)), null);
  for (const mod of ['ctrlKey', 'altKey', 'metaKey']) assert.equal(keyboardObjectNudge(obj, event('ArrowRight', { [mod]: true })), null);
});
test('missing or invalid objects cannot be moved', () => {
  assert.equal(keyboardObjectNudge(null, event('ArrowDown')), null);
  assert.equal(keyboardObjectNudge({ x: NaN, y: 10 }, event('ArrowDown')), null);
});
test('never mutates the original model object', () => {
  const original = { x: 40, y: 30 };
  keyboardObjectNudge(original, event('ArrowUp'));
  assert.deepEqual(original, { x: 40, y: 30 });
});
