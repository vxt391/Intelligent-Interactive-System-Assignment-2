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
    avoidedTypography: typography.avoid,
    layout: chooseSingle(layouts.positive),
    avoidedLayouts: layouts.avoid,
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

/**
 * Milestone 5.1 — a deterministic, explainable exploration of the small
 * predefined design catalogue. This is NOT a generative-AI model.
 *
 * Two suggestions prioritise explicitly confirmed Likes. A third deliberately
 * explores a different combination, while respecting Avoids and requirements.
 * Unconfirmed draft feedback and Not sure ratings are never used for ranking.
 */

const VALID_SENTIMENTS = new Set(['like', 'avoid']);

function fingerprint(concept) {
  return [concept.styleId, concept.palette, concept.typography, concept.layout].join('|');
}

export function explicitRequirements(brief) {
  // Limit 'hard' requirements to the small vocabulary this prototype can parse.
  // General wishes ('I want...', 'professional...') remain softer prompt hints.
  const requirements = { colour: new Set(), typography: new Set(), layout: new Set() };
  const clauses = brief.split(/[.!?;\n]+|\bbut\b|\band\s+(?=avoid\b|no\b|without\b|never\b)/i);
  for (const clause of clauses) {
    if (!/\b(?:must|only|definitely|required?|have to|need to)\b/i.test(clause)) continue;
    // Negated requirements are not interpreted as positive requirements.
    if (/\b(?:must|should|need to|have to)\s+not\b|\b(?:do not|don't|without|avoid|never)\b/i.test(clause)) continue;
    const hints = inspectPrompt(clause);
    // Multiple strict colours in the same clause are not silently reduced to
    // a single choice (inspectPrompt intentionally reports them as ambiguous).
    const colours = analyseCues(clause.toLowerCase(), COLOUR_CUES);
    for (const colour of colours.positive) requirements.colour.add(colour);
    if (hints.typography) requirements.typography.add(hints.typography);
    if (hints.layout) requirements.layout.add(hints.layout);
  }
  return requirements;
}

export function matchedPreference(concept, preference) {
  switch (preference.category) {
    case 'Colour': return concept.palette === preference.value;
    case 'Typography': return concept.typography === preference.value;
    case 'Layout': return concept.layout === preference.value;
    case 'Style': return concept.styleId === preference.value;
    case 'Decoration': return (concept.decorationId || concept.styleId) === preference.value;
    default: return false;
  }
}

function pickFromCandidates(candidates, chosen, previousKeys, likes, promptHints, round, exploratory) {
  const available = candidates.filter((candidate) => !chosen.some((item) => item.key === candidate.key));
  if (available.length === 0) return null;
  // Whenever possible, don't repeat a previously displayed exact combination.
  const fresh = available.filter((candidate) => !previousKeys.has(candidate.key));
  const pool = fresh.length ? fresh : available;

  function rank(candidate) {
    const matches = likes.filter((item) => matchedPreference(candidate.concept, item));
    const softMatches = (
      (promptHints.colour === candidate.concept.paletteFamily ? 1 : 0) +
      (promptHints.typography === candidate.concept.typography ? 1 : 0) +
      (promptHints.layout === candidate.concept.layout ? 1 : 0)
    );
    const variety = (
      (!chosen.some((item) => item.concept.styleId === candidate.concept.styleId) ? 30 : 0) +
      (!chosen.some((item) => item.concept.paletteFamily === candidate.concept.paletteFamily) ? 14 : 0) +
      (!chosen.some((item) => item.concept.layout === candidate.concept.layout) ? 7 : 0) +
      (!chosen.some((item) => item.concept.typography === candidate.concept.typography) ? 4 : 0)
    );
    // Cycle consistently across rounds, while preferring less-used combinations.
    const rotation = (candidate.index * 41 + round * 37) % 101;
    const preferenceScore = likes.length
      ? (exploratory ? -135 : 135) * matches.length
      : 0;
    return preferenceScore + softMatches * (exploratory ? 2 : 13) + variety + rotation / 12;
  }

  return pool.reduce((best, candidate) =>
    !best || rank(candidate) > rank(best) ? candidate : best, null);
}

/**
 * @param {{originalBrief: string, preferences: object[], round: number, previousConcepts: object[]}} context
 * @returns {object} new recommendation data, or {blockedReason: string}
 */
export function buildNewDirectionRecommendations({
  originalBrief = '', preferences = [], round = 2, previousConcepts = [],
}) {
  const active = preferences.filter((item) => VALID_SENTIMENTS.has(item.sentiment));
  const likes = active.filter((item) => item.sentiment === 'like');
  const avoids = active.filter((item) => item.sentiment === 'avoid');
  const hints = inspectPrompt(originalBrief);
  const hard = explicitRequirements(originalBrief);

  const conflictingRequirement = Object.entries(hard).find(([, values]) => values.size > 1);
  if (conflictingRequirement) {
    return {
      blockedReason: `The original brief contains more than one strict ${conflictingRequirement[0]} requirement that this prototype cannot combine. Review the brief before exploring new directions.`,
    };
  }

  const hardColour = [...hard.colour][0] ?? null;
  const hardTypography = [...hard.typography][0] ?? null;
  const hardLayout = [...hard.layout][0] ?? null;

  const prohibitedColours = new Set(hints.avoidedColours);
  if (hardTypography && hints.avoidedTypography.includes(hardTypography)) {
    return { blockedReason: `The original brief both requires and excludes ${hardTypography} typography. Please resolve this conflict before continuing.` };
  }
  if (hardLayout && hints.avoidedLayouts.includes(hardLayout)) {
    return { blockedReason: `The original brief both requires and excludes ${hardLayout} layout. Please resolve this conflict before continuing.` };
  }
  if (hardColour && prohibitedColours.has(hardColour)) {
    return {
      blockedReason: `The original brief both requires and excludes ${hardColour}. The system cannot choose between these instructions automatically.`,
    };
  }

  const previousKeys = new Set(previousConcepts.map(fingerprint));
  const candidates = [];
  let index = 0;

  for (const template of DESIGN_TEMPLATES) {
    for (const [paletteFamily, variants] of Object.entries(PALETTES)) {
      if (prohibitedColours.has(paletteFamily)) continue;
      if (hardColour && paletteFamily !== hardColour) continue;
      for (const palette of variants) {
        for (const typography of ['serif', 'sans']) {
          if (hardTypography && typography !== hardTypography) continue;
          if (hints.avoidedTypography.includes(typography)) continue;
          for (const layout of ['spacious', 'structured', 'dynamic']) {
            if (hardLayout && layout !== hardLayout) continue;
            if (hints.avoidedLayouts.includes(layout)) continue;

            const concept = {
              id: `round-${round}-concept-${template.id}-${paletteFamily}-${variants.indexOf(palette)}-${typography}-${layout}`,
              name: template.name,
              styleId: template.id,
              style: template.style,
              brand: template.brand,
              role: template.role,
              background: palette.bg,
              foreground: palette.fg,
              accent: palette.accent,
              palette: palette.label,
              paletteFamily,
              typography,
              layout,
            };
            if (avoids.some((item) => matchedPreference(concept, item))) continue;
            candidates.push({ key: fingerprint(concept), concept, index: index++ });
          }
        }
      }
    }
  }

  if (candidates.length < 3) {
    return {
      blockedReason: 'The available design catalogue cannot produce three options while respecting all recognised requirements and Avoid preferences. You can revise your confirmed preferences in Current Intentions.',
    };
  }

  const chosen = [];
  for (let slot = 0; slot < 3; slot++) {
    const candidate = pickFromCandidates(
      candidates, chosen, previousKeys, likes, hints, round, slot === 2
    );
    if (!candidate) break;
    chosen.push(candidate);
  }

  const concepts = chosen.map(({ concept }, slot) => {
    const matching = likes.filter((item) => matchedPreference(concept, item));
    const exploratory = slot === 2;
    const matchText = matching.length
      ? `Matches confirmed Likes: ${matching.map((item) => item.label).join(', ')}.`
      : likes.length ? 'Explores other characteristics beyond your confirmed Likes.' : 'Explores a fresh combination of design characteristics.';
    return {
      ...concept,
      direction: exploratory ? 'Exploratory' : matching.length ? 'Preference-led' : 'New direction',
      matchedPreferenceIds: matching.map((item) => item.id),
      rationale: exploratory
        ? `${matchText} This alternative still respects your confirmed Avoid choices.`
        : `${matchText} This is one possible interpretation of your intentions.`,
    };
  });

  const matchedLedCount = concepts.slice(0, 2).filter((concept) => concept.matchedPreferenceIds.length > 0).length;
  const likeDescription = !likes.length
    ? 'You have no confirmed Like preferences, so these are varied new directions rather than personalised matches.'
    : matchedLedCount === 2
      ? `Two concepts prioritise your confirmed Like preferences, while the third explores an alternative.`
      : matchedLedCount === 1
        ? 'One option matches your confirmed Likes. The other directions explore alternatives because your requirements or Avoid choices limit the available matches.'
        : 'The current catalogue and constraints cannot represent your confirmed Likes in this round. These directions remain exploratory; no Likes were treated as satisfied.';
  const avoidDescription = avoids.length
    ? `All three avoid the ${avoids.length} attribute ${avoids.length === 1 ? 'choice' : 'choices'} marked Avoid.`
    : 'No confirmed Avoid constraints are currently active.';
  const strictDescription = hardColour || hardTypography || hardLayout
    ? 'Recognised explicit requirements in your original brief were also kept.'
    : '';

  return {
    round,
    source: 'new-directions',
    concepts,
    explanation: `${likeDescription} ${avoidDescription} ${strictDescription}`.trim(),
    disclosure: 'Simulated, deterministic CSS designs from a limited catalogue — not images generated by an AI model. Only confirmed Like/Avoid ratings and recognised original-brief cues are used; draft and Not sure feedback do not affect this round.',
  };
}
