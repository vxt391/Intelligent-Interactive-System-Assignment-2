import { DESIGN_TEMPLATES, PALETTES } from '../data/concepts';

/**
 * A deliberately small keyword-based simulation. It does not interpret arbitrary English.
 * Extracted hints influence only this recommendation set; they are NOT confirmed preferences.
 */
const COLOUR_CUES = [
  { key: 'navy', pattern: /\bnavy\b/g },
  { key: 'green', pattern: /\b(?:green|sage|olive)\b/g },
  { key: 'blue', pattern: /\bblue\b/g },
  { key: 'peach', pattern: /\b(?:peach|coral|terracotta)\b/g },
  { key: 'beige', pattern: /\b(?:beige|cream|ivory)\b/g },
  { key: 'purple', pattern: /\b(?:purple|lavender|lilac|violet)\b/g },
  { key: 'charcoal', pattern: /\b(?:black|charcoal|graphite|grey|gray)\b/g },
];

const NEGATIVE_PREFIX = /\b(?:avoid|dislike|no|not|without|don't want|do not want|don't like|do not like)\s+(?:(?:any|a|an|the|bright|muted|dark|deep|light|soft)\s+)*$/;
const UNSURE_PREFIX = /\b(?:not sure|unsure|undecided|uncertain|no preference)(?:\s+(?:about|on|for|whether))?\s+(?:(?:the|my|a)\s+)*$/;

function statusForMention(text, index) {
  const before = text.slice(Math.max(0, index - 55), index);
  if (UNSURE_PREFIX.test(before)) return 'uncertain';
  if (NEGATIVE_PREFIX.test(before)) return 'avoid';
  return 'positive';
}

function analyseCues(text, cues) {
  const positive = new Set();
  const avoid = new Set();
  for (const cue of cues) {
    for (const match of text.matchAll(cue.pattern)) {
      // Do not misinterpret the 'serif' part of 'sans-serif'.
      if (cue.key === 'serif' && /sans[-\s]$/.test(text.slice(0, match.index))) continue;
      if (cue.key === 'blue' && /navy\s+$/.test(text.slice(0, match.index))) continue;
      const status = statusForMention(text, match.index);
      if (status === 'positive') positive.add(cue.key);
      if (status === 'avoid') avoid.add(cue.key);
    }
  }
  for (const key of avoid) positive.delete(key);
  return { positive: [...positive], avoid: [...avoid] };
}

function chooseSingle(values) {
  return values.length === 1 ? values[0] : null;
}

export function isBusinessCardRequest(prompt) {
  return /\b(?:business[-\s]?cards?|visiting\s+cards?)\b/i.test(prompt);
}

export function inspectPrompt(prompt) {
  const text = prompt.toLowerCase().replace(/[\u2018\u2019]/g, "'");
  const colours = analyseCues(text, COLOUR_CUES);
  const typography = analyseCues(text, [
    { key: 'sans', pattern: /\bsans[-\s]?serif\b/g },
    { key: 'serif', pattern: /\bserif\b/g },
  ]);
  const layouts = analyseCues(text, [
    { key: 'spacious', pattern: /\b(?:spacious|airy|open layout)\b/g },
    { key: 'structured', pattern: /\b(?:structured|grid[-\s]?based|aligned)\b/g },
    { key: 'dynamic', pattern: /\b(?:asymmetrical|asymmetric|dynamic layout|playful layout)\b/g },
  ]);

  return {
    colour: chooseSingle(colours.positive),
    avoidedColours: colours.avoid,
    typography: chooseSingle(typography.positive),
    layout: chooseSingle(layouts.positive),
    ambiguousColours: colours.positive.length > 1,
  };
}

function pickPalette(preferred, excluded, template, index) {
  const permitted = Object.keys(PALETTES).filter((key) => !excluded.includes(key));
  const fallback = ['beige', 'navy', 'peach', 'green', 'purple', 'blue', 'charcoal'];
  const key = preferred && permitted.includes(preferred)
    ? preferred
    : permitted.includes(template.basePalette)
      ? template.basePalette
      : fallback.find((candidate) => permitted.includes(candidate)) || 'beige';

  return { key, ...PALETTES[key][preferred === key ? index : (key === 'navy' ? 1 : key === 'peach' ? 2 : 0)] };
}

export function buildInitialRecommendations(prompt) {
  const hints = inspectPrompt(prompt);
  const concepts = DESIGN_TEMPLATES.map((template, index) => {
    const palette = pickPalette(hints.colour, hints.avoidedColours, template, index);
    const typography = hints.typography || template.typography;
    const layout = hints.layout || template.layout;

    return {
      id: `concept-${template.id}`,
      name: template.name,
      styleId: template.id,
      style: template.style,
      brand: template.brand,
      role: template.role,
      background: palette.bg,
      foreground: palette.fg,
      accent: palette.accent,
      palette: palette.label,
      typography,
      layout,
      rationale: template.rationale,
    };
  });

  const recognised = [
    hints.colour ? `${hints.colour} colour` : null,
    hints.typography ? `${hints.typography === 'sans' ? 'sans-serif' : 'serif'} typography` : null,
    hints.layout ? `${hints.layout} layout` : null,
    hints.avoidedColours.length ? `avoiding ${hints.avoidedColours.join(', ')}` : null,
  ].filter(Boolean);

  let explanation = recognised.length
    ? `I used these recognised wording cues: ${recognised.join('; ')}.`
    : 'No specific supported design attributes were confidently identified, so the concepts explore different directions.';
  if (hints.ambiguousColours) {
    explanation += ' Several colours were mentioned, so I did not assume one preferred colour.';
  }

  return {
    concepts,
    explanation,
    disclosure: 'Rule-based, CSS-rendered examples — not AI-generated images. Prompt wording is not saved as a confirmed preference.',
  };
}
