import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_REFINEMENT_ZOOM, MAX_REFINEMENT_ZOOM,
  refinementZoomValue, nextRefinementZoom, refinementZoomShortcut,
} from '../src/utils/refinementZoom.js';

test('zoom default, steps and reset values', () => {
  assert.equal(refinementZoomValue(undefined), 100);
  assert.equal(nextRefinementZoom(100, 1), 110);
  assert.equal(nextRefinementZoom(110, -1), 100);
  assert.equal(refinementZoomValue(150), 150);
});

test('zoom clamps to 50–200 even with repeated increments', () => {
  let value = 100;
  for (let i = 0; i < 100; i++) value = nextRefinementZoom(value, 1);
  assert.equal(value, MAX_REFINEMENT_ZOOM);
  for (let i = 0; i < 100; i++) value = nextRefinementZoom(value, -1);
  assert.equal(value, MIN_REFINEMENT_ZOOM);
  assert.equal(refinementZoomValue(Infinity), 100);
  assert.equal(refinementZoomValue('nonsense'), 100);
});

test('Ctrl+plus/minus and numpad shortcuts are recognised', () => {
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: '+', code: 'Equal' }), 1);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: '=', code: 'Equal' }), 1);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: '-', code: 'Minus' }), -1);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: '_', code: 'Minus' }), -1);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: 'Add', code: 'NumpadAdd' }), 1);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: 'Subtract', code: 'NumpadSubtract' }), -1);
});

test('plain keys, Alt and text field editing are not intercepted', () => {
  assert.equal(refinementZoomShortcut({ key: '+', code: 'Equal' }), 0);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, altKey: true, key: '-' }), 0);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: '+', target: { isContentEditable: true } }), 0);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: '+', target: { closest: () => ({}) } }), 0);
  assert.equal(refinementZoomShortcut({ ctrlKey: true, key: 'p', code: 'KeyP' }), 0);
});
