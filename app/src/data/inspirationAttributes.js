/**
 * Phase 3.2: Curated, descriptive attributes for fictional Community projects.
 * These are inspiration labels, NOT automatic mappings to business-card rules.
 * Project-specific application is deliberately deferred to Milestone 3.3.
 */
const option = (dimension, label, description) => ({
  id: `${dimension.toLowerCase()}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  dimension,
  label,
  description,
});

export const COMMUNITY_PROJECT_ATTRIBUTES = {
  orbital: [
    option('Colour', 'Violet and lilac', 'A cool-toned, restrained colour relationship'),
    option('Layout', 'Balanced geometry', 'Careful alignment and negative space'),
    option('Typography', 'Simple sans-serif', 'Quiet, contemporary lettering'),
    option('Decorations', 'Geometric shapes', 'Minimal geometric visual accents'),
  ],
  'blue-hour': [
    option('Colour', 'Evening blue', 'Deep blue and muted atmospheric tones'),
    option('Layout', 'Open composition', 'Space around a single focal point'),
    option('Typography', 'Minimal text', 'A restrained editorial presentation'),
    option('Decorations', 'Soft gradients', 'Gentle transitions between tones'),
  ],
  citrus: [
    option('Colour', 'Warm citrus colours', 'Energetic oranges, yellows and greens'),
    option('Layout', 'Playful asymmetry', 'An informal, lively arrangement'),
    option('Typography', 'Friendly lettering', 'Approachable and expressive type'),
    option('Decorations', 'Hand-drawn forms', 'Organic illustrative elements'),
  ],
  forma: [
    option('Colour', 'Black and white', 'High-contrast monochrome'),
    option('Layout', 'Structured grid', 'Strong alignment and order'),
    option('Typography', 'Oversized bold type', 'Type used as the focal point'),
    option('Decorations', 'Minimal ornaments', 'Few additional elements'),
  ],
  ressa: [
    option('Colour', 'Deep green and gold', 'Subtle premium contrast'),
    option('Layout', 'Clean spacing', 'Deliberate separation of elements'),
    option('Typography', 'Elegant type', 'Refined brand lettering'),
    option('Decorations', 'Fine-line details', 'Subtle visual accents'),
  ],
  chromatic: [
    option('Colour', 'Iridescent gradients', 'Shifting, vibrant colours'),
    option('Layout', 'Centered focal form', 'One sculptural focus'),
    option('Typography', 'Understated labels', 'Minimal supporting text'),
    option('Decorations', 'Fluid shapes', 'Curving three-dimensional forms'),
  ],
  'quiet-space': [
    option('Colour', 'Neutral concrete tones', 'Quiet grey and warm off-white'),
    option('Layout', 'Geometric composition', 'Architectural lines and balance'),
    option('Typography', 'Uncluttered text', 'Very light typographic treatment'),
    option('Decorations', 'Light and shadow', 'Subtle tonal structure'),
  ],
  mellow: [
    option('Colour', 'Soft pastel colours', 'Gentle, low-contrast tones'),
    option('Layout', 'Clear visual hierarchy', 'Predictable spacing and grouping'),
    option('Typography', 'Readable sans-serif', 'Accessible interface lettering'),
    option('Decorations', 'Rounded elements', 'Soft edges and simple accents'),
  ],
  harmony: [
    option('Colour', 'Bold orange contrast', 'Vibrant colour energy'),
    option('Layout', 'Rhythmic composition', 'Repeating arrangement of forms'),
    option('Typography', 'Playful headline', 'Expressive display lettering'),
    option('Decorations', 'Repeated patterns', 'A visual motif across the composition'),
  ],
  garden: [
    option('Colour', 'Botanical greens', 'Natural, varied green tones'),
    option('Layout', 'Organic composition', 'Natural and unforced placement'),
    option('Typography', 'Subtle captions', 'Text kept secondary to imagery'),
    option('Decorations', 'Leaf motifs', 'Botanical illustrative details'),
  ],
  nova: [
    option('Colour', 'Vivid pink contrast', 'High-energy poster colours'),
    option('Layout', 'Dynamic composition', 'Strong diagonals and visual motion'),
    option('Typography', 'Oversized headlines', 'Type with energetic scale'),
    option('Decorations', 'Sharp graphic shapes', 'High-impact visual additions'),
  ],
  'little-world': [
    option('Colour', 'Cheerful warm colours', 'Friendly, varied colour combinations'),
    option('Layout', 'Story-led composition', 'Elements arranged for a narrative'),
    option('Typography', 'Soft playful type', 'Informal, approachable lettering'),
    option('Decorations', 'Character illustrations', 'Small expressive figures'),
  ],
  nook: [
    option('Colour', 'Muted editorial tones', 'Subtle background and text contrast'),
    option('Layout', 'Card-based hierarchy', 'Distinct content areas and spacing'),
    option('Typography', 'Editorial typography', 'Comfortable, text-forward treatment'),
    option('Decorations', 'Light dividers', 'Minimal interface accents'),
  ],
  terra: [
    option('Colour', 'Earth-tone palette', 'Natural browns, greens and creams'),
    option('Layout', 'Relaxed balance', 'An organic but ordered arrangement'),
    option('Typography', 'Refined lettering', 'Clean branding text'),
    option('Decorations', 'Organic forms', 'Nature-inspired graphic accents'),
  ],
  arc: [
    option('Colour', 'Metallic neutrals', 'Cool reflective tones'),
    option('Layout', 'Single focal object', 'An uncluttered central composition'),
    option('Typography', 'Minimal captions', 'Type does not compete with imagery'),
    option('Decorations', 'Curved forms', 'Fluid arcs and sculptural elements'),
  ],
  'type-lab': [
    option('Colour', 'Cream and dark ink', 'Subtle high contrast'),
    option('Layout', 'Layered editorial grid', 'Type arranged in structured layers'),
    option('Typography', 'Expressive serif type', 'Characterful display lettering'),
    option('Decorations', 'Letterform details', 'Decorations built from typography'),
  ],
};

export function getInspirationAttributes(projectId) {
  return COMMUNITY_PROJECT_ATTRIBUTES[projectId] ?? [];
}
