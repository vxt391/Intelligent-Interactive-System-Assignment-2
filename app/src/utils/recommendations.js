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

/**
 * The submitted prompt is the baseline for generation. Later confirmed updates
 * override only their own dimension, rather than concatenating old and new cues.
 */
export function resolveBriefRules(originalBrief = '', activeBrief = null, roundOverrides = {}) {
  const baseText = activeBrief?.submittedText || originalBrief;
  const hints = inspectPrompt(baseText);
  const hard = explicitRequirements(baseText);
  const updates = activeBrief?.updates || {};
  let requiredDecoration = null;
  let avoidedDecoration = null;
  for (const [dimension, revision] of Object.entries(updates)) {
    if (!revision || !['require', 'avoid'].includes(revision.mode)) continue;
    const value = revision.value;
    if (dimension === 'colour') {
      hints.colour = revision.mode === 'require' ? value : null;
      hints.avoidedColours = revision.mode === 'avoid' ? [value] : [];
      hard.colour = new Set(revision.mode === 'require' ? [value] : []);
    } else if (dimension === 'typography') {
      hints.typography = revision.mode === 'require' ? value : null;
      hints.avoidedTypography = revision.mode === 'avoid' ? [value] : [];
      hard.typography = new Set(revision.mode === 'require' ? [value] : []);
    } else if (dimension === 'layout') {
      hints.layout = revision.mode === 'require' ? value : null;
      hints.avoidedLayouts = revision.mode === 'avoid' ? [value] : [];
      hard.layout = new Set(revision.mode === 'require' ? [value] : []);
    } else if (dimension === 'decoration') {
      requiredDecoration = revision.mode === 'require' ? value : null;
      avoidedDecoration = revision.mode === 'avoid' ? value : null;
    }
  }
  for (const dimension of roundOverrides.ignoreRequiredDimensions || []) {
    if (hard[dimension]) hard[dimension] = new Set();
    if (dimension === 'colour') hints.colour = null;
    if (dimension === 'typography') hints.typography = null;
    if (dimension === 'layout') hints.layout = null;
    if (dimension === 'decoration') requiredDecoration = null;
  }
  for (const dimension of roundOverrides.ignoreBriefAvoidDimensions || []) {
    if (dimension === 'colour') hints.avoidedColours = [];
    if (dimension === 'typography') hints.avoidedTypography = [];
    if (dimension === 'layout') hints.avoidedLayouts = [];
    if (dimension === 'decoration') avoidedDecoration = null;
  }
  return { hints, hard, requiredDecoration, avoidedDecoration, baseText };
}

function paletteFamilyForPreference(preference) {
  if (PALETTES[preference.value]) return preference.value;
  return Object.keys(PALETTES).find((key) =>
    PALETTES[key].some((palette) => palette.label === preference.value)
  ) || null;
}

export function getBriefPreferenceConflicts({ originalBrief = '', activeBrief = null, preferences = [] }) {
  const { hints, hard, requiredDecoration, avoidedDecoration } = resolveBriefRules(originalBrief, activeBrief);
  const conflicts = [];
  const requirement = {
    colour: [...hard.colour][0], typography: [...hard.typography][0],
    layout: [...hard.layout][0], decoration: requiredDecoration,
  };
  for (const [dimension, value] of Object.entries(requirement)) {
    if (!value) continue;
    const excludedInBrief = (dimension === 'colour' ? hints.avoidedColours :
      dimension === 'typography' ? hints.avoidedTypography :
      dimension === 'layout' ? hints.avoidedLayouts : [avoidedDecoration]).includes(value);
    if (excludedInBrief) conflicts.push({
      id: `brief:${dimension}:${value}`, dimension, kind: 'brief-self',
      detail: `The active brief both requires and excludes ${value} (${dimension}).`,
    });
    for (const preference of preferences.filter((p) => p.sentiment === 'avoid')) {
      const overlapping = dimension === 'colour'
        ? preference.category === 'Colour' && paletteFamilyForPreference(preference) === value
        : dimension === 'typography' ? preference.category === 'Typography' && preference.value === value
        : dimension === 'layout' ? preference.category === 'Layout' && preference.value === value
        : ['Decoration', 'Style'].includes(preference.category) && preference.value === value;
      if (!overlapping) continue;
      conflicts.push({
        id: `preference:${preference.id}`, dimension, kind: 'brief-preference', preferenceId: preference.id,
        detail: `The active brief requires ${value} (${dimension}), but Current Intentions marks “${preference.label}” as Avoid. This may limit the available designs.`,
      });
    }
  }
  return conflicts;
}

/** Keep Milestone 3's familiar first-round templates while enforcing
 * supported positive cues, explicit requirements and negative exclusions. */
export function buildInitialRecommendations(prompt, activeBrief = null) {
  const { hints, hard, requiredDecoration, avoidedDecoration } = resolveBriefRules(prompt, activeBrief);
  if (Object.entries(hard).some(([, values]) => values.size > 1)) {
    return { blockedReason: 'The active brief includes multiple incompatible strict requirements in the same design category. Please clarify your prompt.' };
  }
  const strictColour = [...hard.colour][0] || null;
  const strictTypography = [...hard.typography][0] || null;
  const strictLayout = [...hard.layout][0] || null;
  if ((strictColour && hints.avoidedColours.includes(strictColour)) ||
      (strictTypography && hints.avoidedTypography.includes(strictTypography)) ||
      (strictLayout && hints.avoidedLayouts.includes(strictLayout))) {
    return { blockedReason: 'The active brief requires and excludes the same supported attribute. Please clarify the conflicting instructions.' };
  }
  const allowedColours = Object.keys(PALETTES).filter((key) => !hints.avoidedColours.includes(key));
  const allowedTypography = ['serif', 'sans'].filter((key) => !hints.avoidedTypography.includes(key));
  const allowedLayouts = ['spacious', 'structured', 'dynamic'].filter((key) => !hints.avoidedLayouts.includes(key));
  if (!allowedColours.length || !allowedTypography.length || !allowedLayouts.length) {
    return { blockedReason: 'The available catalogue cannot satisfy all excluded attributes. Please revise your prompt.' };
  }
  const palettePreferred = strictColour || hints.colour;
  const typographyPreferred = strictTypography || hints.typography;
  const layoutPreferred = strictLayout || hints.layout;
  const concepts = DESIGN_TEMPLATES.map((template, index) => {
    const palette = pickPalette(palettePreferred, hints.avoidedColours, template, index);
    const typography = allowedTypography.includes(typographyPreferred)
      ? typographyPreferred : allowedTypography.includes(template.typography)
        ? template.typography : allowedTypography[0];
    const layout = allowedLayouts.includes(layoutPreferred)
      ? layoutPreferred : allowedLayouts.includes(template.layout)
        ? template.layout : allowedLayouts[0];
    const decorationId = requiredDecoration ||
      (avoidedDecoration === template.id
        ? ['minimal', 'botanical', 'expressive'].find((key) => key !== avoidedDecoration)
        : template.id);
    return {
      id: `concept-${template.id}`, name: template.name,
      styleId: template.id, style: template.style, brand: template.brand,
      role: template.role, background: palette.bg, foreground: palette.fg,
      accent: palette.accent, palette: palette.label, paletteFamily: palette.key,
      typography, layout, decorationId,
      rationale: template.rationale,
    };
  });
  if (strictColour && concepts.some((concept) => concept.paletteFamily !== strictColour)) {
    return { blockedReason: 'The requested strict colour is not supported by the available design palettes.' };
  }
  const recognised = [
    palettePreferred ? `${palettePreferred} palette` : null,
    typographyPreferred ? `${typographyPreferred} typography` : null,
    layoutPreferred ? `${layoutPreferred} layout` : null,
    hints.avoidedColours.length ? `avoiding ${hints.avoidedColours.join(', ')}` : null,
    hints.avoidedTypography.length ? `avoiding ${hints.avoidedTypography.join(', ')} typography` : null,
    hints.avoidedLayouts.length ? `avoiding ${hints.avoidedLayouts.join(', ')} layouts` : null,
    requiredDecoration ? `${requiredDecoration} decoration` : null,
    avoidedDecoration ? `avoiding ${avoidedDecoration} decoration` : null,
  ].filter(Boolean);
  return {
    concepts,
    explanation: recognised.length
      ? `The initial concept templates use these supported cues: ${recognised.join('; ')}.`
      : 'These three familiar concept templates explore different directions. No specific supported attributes were confidently identified.',
    disclosure: 'Rule-based CSS previews, not AI-generated images. Recognised prompt cues are not automatically saved as confirmed preferences.',
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
  originalBrief = '', activeBrief = null, preferences = [], round = 2, previousConcepts = [],
  roundOverrides = {},
}) {
  const ignoreAvoidIds = new Set(roundOverrides.ignoreAvoidPreferenceIds || []);
  const active = preferences.filter((item) => VALID_SENTIMENTS.has(item.sentiment) && !ignoreAvoidIds.has(item.id));
  const likes = active.filter((item) => item.sentiment === 'like');
  const avoids = active.filter((item) => item.sentiment === 'avoid');
  const { hints, hard, requiredDecoration, avoidedDecoration } = resolveBriefRules(originalBrief, activeBrief, roundOverrides);

  const conflictingRequirement = Object.entries(hard).find(([, values]) => values.size > 1);
  if (conflictingRequirement) {
    return {
      blockedReason: `The active brief contains more than one strict ${conflictingRequirement[0]} requirement that this prototype cannot combine. Review the brief before exploring new directions.`,
    };
  }

  const hardColour = [...hard.colour][0] ?? null;
  const hardTypography = [...hard.typography][0] ?? null;
  const hardLayout = [...hard.layout][0] ?? null;

  const prohibitedColours = new Set(hints.avoidedColours);
  if (hardTypography && hints.avoidedTypography.includes(hardTypography)) {
    return { blockedReason: `The active brief both requires and excludes ${hardTypography} typography. Please resolve this conflict before continuing.` };
  }
  if (hardLayout && hints.avoidedLayouts.includes(hardLayout)) {
    return { blockedReason: `The active brief both requires and excludes ${hardLayout} layout. Please resolve this conflict before continuing.` };
  }
  if (hardColour && prohibitedColours.has(hardColour)) {
    return {
      blockedReason: `The active brief both requires and excludes ${hardColour}. The system cannot choose between these instructions automatically.`,
    };
  }

  const previousKeys = new Set(previousConcepts.map(fingerprint));
  const candidates = [];
  let index = 0;

  for (const template of DESIGN_TEMPLATES) {
    if (requiredDecoration && template.id !== requiredDecoration) continue;
    if (avoidedDecoration && template.id === avoidedDecoration) continue;
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
    disclosure: 'Simulated, deterministic CSS designs from a limited catalogue — not images generated by an AI model. Only confirmed Likes/Avoids and recognised active-brief rules are used; drafts and Not sure feedback are excluded.',
  };
}
