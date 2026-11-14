/**
 * Map a displayed recommendation to selectable, stable attribute identifiers.
 * IDs are based on a category and a visible value, not on the source concept.
 * If two concepts share the same value, it is selected only once.
 */
const TYPOGRAPHY_LABELS = { serif: 'Serif typography', sans: 'Sans-serif typography' };
const LAYOUT_LABELS = {
  spacious: 'Spacious layout',
  structured: 'Structured layout',
  dynamic: 'Dynamic layout',
};

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function attribute(category, label, value) {
  return { id: `${category.toLowerCase()}:${slug(value)}`, category, label, value };
}

export function attributesForConcept(concept) {
  return [
    attribute('Colour', concept.palette, concept.palette),
    attribute('Typography', TYPOGRAPHY_LABELS[concept.typography] || concept.typography, concept.typography),
    attribute('Layout', LAYOUT_LABELS[concept.layout] || concept.layout, concept.layout),
    attribute('Style', `${concept.style} style`, concept.styleId),
  ];
}
