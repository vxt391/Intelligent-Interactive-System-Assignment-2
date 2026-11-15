/**
 * Milestone 5.2 — deterministic variation engine for the EXISTING CSS previews.
 * A reference design is never mutated. Only selected dimensions (plus explicitly
 * authorised conflict corrections) can change; the brand/template is preserved.
 * This module does not call an AI image generator or persist any design.
 */
import { PALETTES } from '../data/concepts';
import { resolveBriefRules, getBriefPreferenceConflicts, matchedPreference } from './recommendations';

export const VARIATION_DIMENSIONS = [
  { id: 'colour', label: 'Colour' },
  { id: 'typography', label: 'Typography' },
  { id: 'layout', label: 'Layout' },
  { id: 'decoration', label: 'Decorations' },
];
const DIMENSIONS = VARIATION_DIMENSIONS.map(({ id }) => id);
const DECORATIONS = ['botanical', 'minimal', 'expressive'];
const TYPOGRAPHIES = ['serif', 'sans'];
const LAYOUTS = ['spacious', 'structured', 'dynamic'];
const DIMENSION_LABELS = Object.fromEntries(VARIATION_DIMENSIONS.map(({ id, label }) => [id, label]));

function referencePaletteFamily(reference) {
  if (reference.paletteFamily && PALETTES[reference.paletteFamily]) return reference.paletteFamily;
  return Object.keys(PALETTES).find((family) =>
    PALETTES[family].some((item) => item.label === reference.palette || item.bg === reference.background)
  ) || null;
}

function decorationOf(concept) {
  return concept.decorationId || concept.styleId;
}

function dimensionsChanged(reference, candidate) {
  return DIMENSIONS.filter((dimension) => {
    switch (dimension) {
      case 'colour': return candidate.palette !== reference.palette;
      case 'typography': return candidate.typography !== reference.typography;
      case 'layout': return candidate.layout !== reference.layout;
      case 'decoration': return decorationOf(candidate) !== decorationOf(reference);
      default: return false;
    }
  });
}

function candidateKey(candidate) {
  return [candidate.styleId, candidate.palette, candidate.typography, candidate.layout, decorationOf(candidate)].join('|');
}

function asSingleRequirement(set, category) {
  if (set.size > 1) return { blockedReason: `The active brief contains multiple strict ${category} requirements that this prototype cannot combine.` };
  return { value: [...set][0] || null };
}

function collectRules({ reference, originalBrief = '', activeBrief = null, preferences = [], conflictResolution = null }) {
  const briefConflicts = getBriefPreferenceConflicts({ originalBrief, activeBrief, preferences });
  const briefDimensions = [...new Set(briefConflicts.map((item) => item.dimension))];
  const roundOverrides = conflictResolution === 'respect'
    ? { ignoreRequiredDimensions: briefDimensions }
    : conflictResolution === 'keep-reference'
      ? { ignoreBriefAvoidDimensions: briefConflicts.filter((item) => item.kind === 'brief-self').map((item) => item.dimension) }
      : {};
  const { hints, hard, requiredDecoration, avoidedDecoration } = resolveBriefRules(originalBrief, activeBrief, roundOverrides);
  const colour = asSingleRequirement(hard.colour, 'colour');
  const typography = asSingleRequirement(hard.typography, 'typography');
  const layout = asSingleRequirement(hard.layout, 'layout');
  const blockedReason = colour.blockedReason || typography.blockedReason || layout.blockedReason;
  const strict = { colour: colour.value, typography: typography.value, layout: layout.value };
  const ignoredAvoidIds = new Set(conflictResolution === 'keep-reference'
    ? briefConflicts.filter((item) => item.preferenceId).map((item) => item.preferenceId) : []);
  const activeAvoids = preferences.filter((p) => p.sentiment === 'avoid' && !ignoredAvoidIds.has(p.id));
  const activeLikes = preferences.filter((p) => p.sentiment === 'like');
  if (blockedReason) return { blockedReason };

  // Conflicting active-brief requirements are explicitly resolved per round.

  // An exact palette Avoid and a strict colour-family requirement can be
  // compatible (other shades may remain); only filter candidate values later.
  const refFamily = referencePaletteFamily(reference);
  const conflicts = briefConflicts.map((item) => ({
    dimension: item.dimension, label: item.dimension, detail: item.detail,
    kind: item.kind, preferenceId: item.preferenceId || null,
  }));
  const add = (dimension, label, detail, kind) => {
    if (!conflicts.some((item) => item.dimension === dimension && item.detail === detail)) {
      conflicts.push({ dimension, label, detail, kind });
    }
  };

  if (strict.colour && refFamily !== strict.colour) {
    add('colour', 'Colour', `Your active brief requires ${strict.colour}, but this reference uses ${reference.palette}.`, 'requirement');
  }
  if (strict.typography && reference.typography !== strict.typography) {
    add('typography', 'Typography', `Your active brief requires ${strict.typography === 'sans' ? 'sans-serif' : 'serif'} typography, but the reference differs.`, 'requirement');
  }
  if (strict.layout && reference.layout !== strict.layout) {
    add('layout', 'Layout', `Your active brief requires a ${strict.layout} layout, but the reference differs.`, 'requirement');
  }
  if (requiredDecoration && decorationOf(reference) !== requiredDecoration) {
    add('decoration', 'Decorations', `Your active brief requires ${requiredDecoration} decorations, but the reference differs.`, 'requirement');
  }
  if (avoidedDecoration && decorationOf(reference) === avoidedDecoration) {
    add('decoration', 'Decorations', `Your active brief excludes ${avoidedDecoration} decorations, but the reference uses them.`, 'brief-avoid');
  }
  if (refFamily && hints.avoidedColours.includes(refFamily)) {
    add('colour', 'Colour', `Your active brief asks to avoid ${refFamily}, but the reference uses ${reference.palette}.`, 'brief-avoid');
  }
  if (hints.avoidedTypography.includes(reference.typography)) {
    add('typography', 'Typography', `Your active brief asks to avoid this typography, but the reference uses it.`, 'brief-avoid');
  }
  if (hints.avoidedLayouts.includes(reference.layout)) {
    add('layout', 'Layout', `Your active brief asks to avoid this layout, but the reference uses it.`, 'brief-avoid');
  }
  for (const preference of activeAvoids) {
    if (matchedPreference(reference, preference)) {
      const dimension = ({ Colour: 'colour', Typography: 'typography', Layout: 'layout', Style: 'style', Decoration: 'decoration' })[preference.category];
      if (dimension) add(dimension, preference.category, `Current Intentions marks “${preference.label}” as Avoid, but the selected reference uses it.`, 'confirmed-avoid');
    }
  }
  return { strict, hints, activeAvoids, activeLikes, conflicts, refFamily, requiredDecoration, avoidedDecoration };
}

export function getVariationConflicts(context) {
  const rules = collectRules(context);
  return { blockedReason: rules.blockedReason || null, conflicts: rules.conflicts || [] };
}

function generateCandidate(reference, colourFamily, palette, typography, layout, decorationId) {
  return {
    ...reference,
    palette: palette.label,
    paletteFamily: colourFamily,
    background: palette.bg,
    foreground: palette.fg,
    accent: palette.accent,
    typography,
    layout,
    decorationId,
  };
}

/**
 * @param {object} context - reference, originalBrief, preferences, selectedDimensions,
 * round, conflictResolution ('respect'|'keep-reference' if conflicts exist),
 * previousConcepts.
 */
export function buildVariationRecommendations({
  reference, originalBrief = '', activeBrief = null, preferences = [], selectedDimensions = [],
  round = 2, referenceRound = 1, referenceMessageId = null,
  conflictResolution = null, previousConcepts = [],
}) {
  if (!reference || !reference.styleId || !reference.palette) {
    return { blockedReason: 'The selected reference concept is unavailable. Please select a design again.' };
  }
  const selected = [...new Set(selectedDimensions)].filter((dimension) => DIMENSIONS.includes(dimension));
  const rules = collectRules({ reference, originalBrief, activeBrief, preferences, conflictResolution });
  if (rules.blockedReason) return { blockedReason: rules.blockedReason };
  const conflicts = rules.conflicts;
  if (conflicts.length && !['respect', 'keep-reference'].includes(conflictResolution)) {
    return { blockedReason: 'Please review the conflict with the selected reference before generating variations.' };
  }
  if (conflictResolution === 'respect' && conflicts.some((item) => item.dimension === 'style')) {
    return { blockedReason: 'Respecting the saved Avoid for this concept’s overall style would require replacing its design identity. Choose “Keep Reference for This Round” as an explicit exception, or use Explore New Directions.' };
  }
  const exceptionDims = new Set(conflictResolution === 'keep-reference' ? conflicts.map((item) => item.dimension) : []);
  const correctionDims = new Set(conflictResolution === 'respect' ? conflicts.map((item) => item.dimension) : []);
  const permitted = new Set(selected.length ? selected : DIMENSIONS);
  for (const dim of correctionDims) permitted.add(dim);
  // Keeping the reference means all non-selected fields remain fixed, including conflicts.
  const baseFamily = rules.refFamily;
  if (!baseFamily) return { blockedReason: 'The selected colour palette is not supported by the current variation catalogue.' };
  const previousKeys = new Set(previousConcepts.map(candidateKey));
  const pool = [];
  let serial = 0;
  const families = permitted.has('colour') ? Object.keys(PALETTES) : [baseFamily];
  for (const family of families) {
    const palettes = permitted.has('colour') ? PALETTES[family] : PALETTES[baseFamily].filter((item) => item.label === reference.palette);
    for (const palette of palettes) {
      for (const type of (permitted.has('typography') ? TYPOGRAPHIES : [reference.typography])) {
        for (const layout of (permitted.has('layout') ? LAYOUTS : [reference.layout])) {
          for (const decoration of (permitted.has('decoration') ? DECORATIONS : [decorationOf(reference)])) {
            const candidate = generateCandidate(reference, family, palette, type, layout, decoration);
            const differences = dimensionsChanged(reference, candidate);
            const changedSelected = differences.filter((item) => selected.includes(item));
            if (!differences.length) continue;
            if (selected.length && !changedSelected.length) continue;
            if (!selected.length && differences.length > 2) continue;
            // Don't let a variation unexpectedly touch an unrelated dimension.
            if (differences.some((dim) => !permitted.has(dim))) continue;
            // A one-round keep-reference exception allows the conflicting exact
            // reference value, not arbitrary new contradictory attribute values.
            const keepException = (dim, valueMatchesReference) =>
              conflictResolution === 'keep-reference' && exceptionDims.has(dim) && valueMatchesReference;
            if (rules.strict.colour && family !== rules.strict.colour && !keepException('colour', candidate.palette === reference.palette)) continue;
            if (rules.strict.typography && type !== rules.strict.typography && !keepException('typography', type === reference.typography)) continue;
            if (rules.strict.layout && layout !== rules.strict.layout && !keepException('layout', layout === reference.layout)) continue;
            if (rules.requiredDecoration && decoration !== rules.requiredDecoration && !keepException('decoration', decoration === decorationOf(reference))) continue;
            if (rules.avoidedDecoration && decoration === rules.avoidedDecoration && !keepException('decoration', decoration === decorationOf(reference))) continue;
            if (rules.hints.avoidedColours.includes(family) && !keepException('colour', candidate.palette === reference.palette)) continue;
            if (rules.hints.avoidedTypography.includes(type) && !keepException('typography', type === reference.typography)) continue;
            if (rules.hints.avoidedLayouts.includes(layout) && !keepException('layout', layout === reference.layout)) continue;
            if (rules.activeAvoids.some((avoid) => matchedPreference(candidate, avoid) && !keepException(
              ({ Colour: 'colour', Typography: 'typography', Layout: 'layout', Style: 'style', Decoration: 'decoration' })[avoid.category],
              matchedPreference(reference, avoid) && (
                avoid.category === 'Colour' ? candidate.palette === reference.palette :
                avoid.category === 'Typography' ? candidate.typography === reference.typography :
                avoid.category === 'Layout' ? candidate.layout === reference.layout :
                avoid.category === 'Decoration' ? decorationOf(candidate) === decorationOf(reference) :
                candidate.styleId === reference.styleId
              )
            ))) continue;
            const key = candidateKey(candidate);
            const liked = rules.activeLikes.filter((like) => matchedPreference(candidate, like)).length;
            pool.push({ candidate, key, differences, changedSelected, liked, index: serial++ });
          }
        }
      }
    }
  }

  if (!pool.length) {
    const scope = selected.length ? selected.map((dim) => DIMENSION_LABELS[dim].toLowerCase()).join(', ') : 'general variation';
    return { blockedReason: `No distinct ${scope} options are available while preserving the selected design and the applicable requirements. Try another attribute, resolve the conflict differently or choose Explore New Directions.` };
  }

  // Option B: different combinations across the three designs. For two
  // dimensions, try A only, B only, then A+B. For 3-4 dimensions, each requested
  // dimension is included in at least one target pattern when possible.
  let patterns;
  if (!selected.length) patterns = [['colour'], ['layout'], ['decoration']];
  else if (selected.length === 1) patterns = [selected, selected, selected];
  else if (selected.length === 2) patterns = [[selected[0]], [selected[1]], selected];
  else if (selected.length === 3) patterns = selected.map((dim) => [dim]);
  else patterns = [[selected[0], selected[1]], [selected[2]], [selected[3]]];

  const chosen = [];
  const covered = new Set();
  for (let slot = 0; slot < 3; slot++) {
    const available = pool.filter((item) => !chosen.some((existing) => existing.key === item.key));
    if (!available.length) break;
    const pattern = patterns[slot];
    const exact = available.filter((item) =>
      item.changedSelected.length === pattern.length &&
      pattern.every((dim) => item.changedSelected.includes(dim))
    );
    // For general variations, match a single changed dimension per target.
    const matchingGeneral = !selected.length
      ? available.filter((item) => item.differences.length === 1 && item.differences[0] === pattern[0])
      : [];
    const usePool = (!selected.length && matchingGeneral.length ? matchingGeneral : exact.length ? exact : available);
    const sorted = usePool.map((item) => {
      const newCoverage = item.changedSelected.filter((dim) => !covered.has(dim)).length;
      const patternOverlap = pattern.filter((dim) => item.differences.includes(dim)).length;
      const matchPenalty = Math.abs(item.changedSelected.length - pattern.length);
      const previousPenalty = previousKeys.has(item.key) ? 25 : 0;
      const novelty = chosen.some((other) => other.candidate.palette === item.candidate.palette) ? 0 : 5;
      const rotation = (item.index * 13 + round * 11 + slot * 19) % 23;
      const score = newCoverage * 70 + patternOverlap * 30 - matchPenalty * 40
        - (item.differences.length - 1) * 8 + item.liked * 6 + novelty
        - previousPenalty + rotation / 10;
      return { ...item, score };
    }).sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    chosen.push(winner);
    winner.changedSelected.forEach((dim) => covered.add(dim));
  }

  const requestedLabels = selected.map((dim) => DIMENSION_LABELS[dim]);
  const coveredAll = selected.every((dim) => covered.has(dim));
  const availableCount = chosen.length;
  const header = selected.length
    ? `Explored ${requestedLabels.join(', ')} in combinations based on your selected reference.`
    : 'Explored small changes while keeping your selected design recognisable.';
  const outcomeNote = !coveredAll
    ? ` The available catalogue could not vary every requested attribute; it varied ${[...covered].map((dim) => DIMENSION_LABELS[dim]).join(', ') || 'none'} instead.`
    : '';
  const countNote = availableCount < 3
    ? ` Only ${availableCount} distinct ${availableCount === 1 ? 'variation is' : 'variations are'} possible within the selected scope and current constraints.`
    : '';
  const conflictNote = conflicts.length
    ? conflictResolution === 'keep-reference'
      ? ' You chose a one-round reference exception; your confirmed preferences remain unchanged.'
      : ' You chose to respect current requirements, including correction of conflicting reference attributes.'
    : '';
  const concepts = chosen.map((item, index) => {
    const preserved = DIMENSIONS.filter((dimension) => !item.differences.includes(dimension));
    const matchedLikes = rules.activeLikes.filter((like) => matchedPreference(item.candidate, like));
    return {
      ...item.candidate,
      id: `round-${round}-variation-${index + 1}`,
      direction: 'Variation',
      changedDimensions: item.differences,
      preservedDimensions: preserved,
      rationale: `Changed: ${item.differences.map((dim) => DIMENSION_LABELS[dim]).join(', ')}. Preserved: ${preserved.map((dim) => DIMENSION_LABELS[dim]).join(', ') || 'none'}.${matchedLikes.length ? ` Matches saved Likes: ${matchedLikes.map((like) => like.label).join(', ')}.` : ''}`,
      matchedPreferenceIds: matchedLikes.map((like) => like.id),
    };
  });
  return {
    source: 'variations', round, concepts,
    reference: { messageId: referenceMessageId, round: referenceRound, conceptId: reference.id, name: reference.name },
    requestedDimensions: selected,
    conflictResolution: conflicts.length ? conflictResolution : null,
    explanation: `${header}${outcomeNote}${countNote}${conflictNote} Confirmed Likes were treated as soft preferences and Avoids were checked against the available designs${conflictResolution === 'keep-reference' ? ', except for your explicit reference exception' : ''}.`,
    disclosure: 'Rule-based CSS variations from a limited catalogue. The original reference stays unchanged. Only confirmed preferences and recognised active-brief requirements are applied; drafts do not affect this round.',
  };
}
