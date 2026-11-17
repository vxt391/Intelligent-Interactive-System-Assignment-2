import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRefinementComposition, editRefinement } from '../src/utils/refinementDraft.js';
import { buildRefinementSvg, refinementExportFilename, EXPORT_WIDTH, EXPORT_HEIGHT } from '../src/utils/refinementExport.js';
const design = (styleId = 'minimal') => makeRefinementComposition({
  id: 'test', name: 'Test', brand: 'FORM /', role: 'DESIGNER', styleId,
  background: '#1a2a3a', foreground: '#ffffff', accent: '#8ccaf2',
  layout: 'structured', typography: 'sans',
});
test('SVG is standalone, declares correct business card size and preserves background', () => {
  const svg = buildRefinementSvg(design());
  assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.match(svg, /width="690" height="431.25"/);
  assert.match(svg, /fill="#1a2a3a"/);
  assert.ok(svg.includes('FORM /'));
  assert.match(svg, /<path d=/); // Built-in brand symbol is vector-based.
  assert.equal(EXPORT_WIDTH, 690);
  assert.equal(EXPORT_HEIGHT, 431.25);
});
test('export excludes hidden objects, pointer pins, edit outlines and chat history', () => {
  const working = design();
  working.objects.name.visible = false;
  const svg = buildRefinementSvg(working);
  assert.ok(!svg.includes('ALEX MORGAN'));
  assert.ok(!svg.includes('phase4-pointer'));
  assert.ok(!svg.includes('selectedIds'));
  assert.ok(!svg.includes('AI Conversation'));
  assert.ok(!svg.includes('edit outline'));
});
test('export includes independent duplicated text and SVG-safe escaping', () => {
  const working = design();
  working.objects['name-copy-1'] = { ...working.objects.name, kind: 'name', text: 'Iris & <Company> "A"', x: 60, y: 55 };
  const svg = buildRefinementSvg(working);
  assert.match(svg, /Iris &amp; &lt;Company&gt; &quot;A&quot;/);
  assert.match(svg, /ALEX MORGAN/);
});
test('shape variants export correct vector elements', () => {
  assert.match(buildRefinementSvg(design('minimal')), /<rect[^>]+opacity=".85"/);
  assert.match(buildRefinementSvg(design('botanical')), /<path[^>]+rotate\(-25/);
  assert.match(buildRefinementSvg(design('expressive')), /<circle /);
});
test('export file names are local-safe and extensions controlled', () => {
  assert.equal(refinementExportFilename('My Client / Card?', 'png'), 'My-Client-Card-business-card.png');
  assert.equal(refinementExportFilename('New Project', 'svg'), 'New-Project-business-card.svg');
  assert.equal(refinementExportFilename('   ', 'zip'), 'intenta-design-business-card.png');
});
test('export rejects missing working copy without fabricating design', () => {
  assert.throws(() => buildRefinementSvg(null), /no editable design/);
});
