import { PALETTES } from '../data/concepts';
import { inspectPrompt } from './recommendations';

const LABELS = {
  colour: 'Colour palette', typography: 'Typography', layout: 'Layout', decoration: 'Decorations',
};
const DISPLAY = {
  serif: 'Serif', sans: 'Sans-serif', spacious: 'Spacious', structured: 'Structured', dynamic: 'Dynamic',
  botanical: 'Botanical', minimal: 'Minimal', expressive: 'Expressive',
};

export function describeBriefValue(value) {
  return DISPLAY[value] || (value ? `${value[0].toUpperCase()}${value.slice(1)}` : 'Not specified');
}

export function createActiveBrief(submittedText) {
  return { submittedText, updates: {} };
}

export function describeActiveBrief(activeBrief) {
  if (!activeBrief) return [];
  return Object.values(activeBrief.updates || {}).map((item) =>
    `${LABELS[item.dimension] || item.dimension}: ${item.mode === 'avoid' ? 'Avoid ' : 'Use '}${describeBriefValue(item.value)}`
  );
}

const DECORATION_CUES = [
  ['botanical', /\b(?:botanical|floral|leafy)\b/g],
  ['minimal', /\b(?:minimalist|minimal|no decorations|without decorations|remove (?:all )?decorations)\b/g],
  ['expressive', /\b(?:expressive|ornamental|decorative)\b/g],
];

/** Conservative, explicit-rule vocabulary; this is NOT general natural-language understanding. */
export function interpretFollowUp(text) {
  const normalised = String(text || '').trim().toLowerCase().replace(/[‘’]/g, "'");
  if (!normalised) return { proposals: [], unsupported: [] };
  // Messages without an instruction are treated as notes, not silent rule changes.
  if (!/\b(?:make|change|switch|use|prefer|want|try|instead|rather|avoid|without|remove|replace|should|could|would|choose|set|keep)\b/.test(normalised)) {
    return { proposals: [], unsupported: ['I could not identify a supported design instruction.'] };
  }
  // When the user explicitly states old → new, inspect the destination rather
  // than treating the earlier value as a second positive preference.
  const valueWords = '(?:navy|green|blue|peach|beige|purple|charcoal|sage|olive|coral|terracotta|cream|ivory|lavender|lilac|violet|black|graphite|grey|gray)';
  const colourText = normalised
    .replace(new RegExp(`\\bfrom\\s+${valueWords}\\s+to\\s+(${valueWords})`, 'g'), 'to $1')
    .replace(new RegExp(`\\b(?:instead of|rather than)\\s+${valueWords}`, 'g'), '');
  const cues = inspectPrompt(colourText);
  const proposals = [];
  const unsupported = [];
  const build = (dimension, positive, avoids) => {
    const uniqueAvoids = [...new Set(avoids)];
    if (positive && uniqueAvoids.includes(positive)) {
      unsupported.push(`The ${LABELS[dimension].toLowerCase()} request both uses and avoids ${describeBriefValue(positive)}.`);
      return;
    }
    if (positive) {
      if (uniqueAvoids.length) unsupported.push(`Additional ${LABELS[dimension].toLowerCase()} exclusions were not stored separately; the requested ${describeBriefValue(positive)} remains the proposed target.`);
      proposals.push({ id: dimension, dimension, mode: 'require', value: positive, label: LABELS[dimension] });
    } else if (uniqueAvoids.length === 1) {
      proposals.push({ id: dimension, dimension, mode: 'avoid', value: uniqueAvoids[0], label: LABELS[dimension] });
    } else if (uniqueAvoids.length > 1) {
      unsupported.push(`More than one ${LABELS[dimension].toLowerCase()} exclusion was mentioned; please clarify one at a time.`);
    }
  };
  if (cues.ambiguousColours) {
    unsupported.push('Several positive colours were mentioned, so no colour change was inferred.');
  } else {
    build('colour', cues.colour, cues.avoidedColours);
  }
  build('typography', cues.typography, cues.avoidedTypography);
  build('layout', cues.layout, cues.avoidedLayouts);

  const decorations = DECORATION_CUES.flatMap(([key, regex]) => [...normalised.matchAll(regex)].map((match) => ({ key, index: match.index })));
  const decorationTypes = [...new Set(decorations.map((item) => item.key))];
  if (decorationTypes.length === 1) {
    // 'Without decorations' requests a minimal style; it does not mean avoid minimal.
    const withoutDecoration = /\b(?:without|no)\s+(?:any\s+)?decorations\b/.test(normalised);
    const avoidDecoration = !withoutDecoration && /\b(?:avoid|without|no)\s+(?:any\s+)?(?:botanical|floral|leafy|minimalist|minimal|expressive|ornamental|decorative)\b/.test(normalised);
    proposals.push({ id: 'decoration', dimension: 'decoration', mode: avoidDecoration ? 'avoid' : 'require', value: decorationTypes[0], label: 'Decorations' });
  } else if (decorationTypes.length > 1) {
    unsupported.push('Multiple decorative styles were mentioned. Please clarify which one to use.');
  }

  // Unmapped qualitative terms are never asserted to have been applied.
  const qualitative = [...normalised.matchAll(/\b(?:elegant|futuristic|luxurious|premium|friendly|sophisticated|cool|professional|modern|creative|muted|bright|pastel|subtle|lighter|darker|more attractive|bolder)\b/g)]
    .map((item) => item[0]);
  if (qualitative.length) unsupported.push(`Descriptions such as “${[...new Set(qualitative)].join(', ')}” were not converted into design rules.`);
  if (!proposals.length && !unsupported.length) unsupported.push('No supported attribute change could be identified.');
  return { proposals, unsupported };
}

export function preferenceConflictsForProposal(proposal, preferences = []) {
  if (proposal.mode !== 'require') return [];
  return preferences.filter((preference) => {
    if (preference.sentiment !== 'avoid') return false;
    if (proposal.dimension === 'colour' && preference.category === 'Colour') {
      return preference.value === proposal.value || Boolean(PALETTES[proposal.value]?.some((p) => p.label === preference.value));
    }
    if (proposal.dimension === 'typography') return preference.category === 'Typography' && preference.value === proposal.value;
    if (proposal.dimension === 'layout') return preference.category === 'Layout' && preference.value === proposal.value;
    if (proposal.dimension === 'decoration') return ['Decoration', 'Style'].includes(preference.category) && preference.value === proposal.value;
    return false;
  });
}

export function makeFollowUpReview(submittedText, preferences) {
  const interpreted = interpretFollowUp(submittedText);
  return {
    text: submittedText,
    unsupported: interpreted.unsupported,
    proposals: interpreted.proposals.map((proposal) => ({
      ...proposal,
      enabled: true,
      conflicts: preferenceConflictsForProposal(proposal, preferences).map((item) => ({ id: item.id, label: item.label })),
      resolution: null,
    })),
  };
}

export function canApplyFollowUpReview(review) {
  if (!review) return false;
  const selected = review.proposals.filter((proposal) => proposal.enabled);
  return selected.length > 0 && selected.every((proposal) => !proposal.conflicts.length || proposal.resolution === 'remove-avoid');
}

/** An atomic, reviewed update. Unselected proposals and existing drafts are untouched. */
export function applyFollowUpReview(project) {
  const review = project.briefReview;
  if (!canApplyFollowUpReview(review)) return project;
  const chosen = review.proposals.filter((proposal) => proposal.enabled);
  const removedIds = new Set(chosen.filter((proposal) => proposal.resolution === 'remove-avoid')
    .flatMap((proposal) => proposal.conflicts.map((item) => item.id)));
  const updates = { ...(project.activeBrief?.updates || {}) };
  chosen.forEach((proposal) => {
    updates[proposal.dimension] = {
      dimension: proposal.dimension, mode: proposal.mode, value: proposal.value, label: proposal.label,
    };
  });
  const removedPreferences = project.intentions.preferences.filter((p) => removedIds.has(p.id));
  const preferences = project.intentions.preferences.filter((p) => !removedIds.has(p.id));
  return {
    ...project,
    activeBrief: { ...(project.activeBrief || createActiveBrief(project.intentions.initialBrief)), updates },
    briefReview: null,
    intentions: { ...project.intentions, preferences },
    messages: [...project.messages, {
      id: project.nextMessageId,
      role: 'brief-updated',
      changes: chosen.map(({ dimension, mode, value, label }) => ({ dimension, mode, value, label })),
      removedPreferences: removedPreferences.map(({ id, label }) => ({ id, label })),
      unsupported: [...review.unsupported],
    }],
    nextMessageId: project.nextMessageId + 1,
  };
}
