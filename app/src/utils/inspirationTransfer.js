/**
 * Milestone 3.3.2 — conservative, curated mapping from Community descriptors to
 * the exact attribute vocabulary used by the Phase 2 recommendation catalogue.
 * An absent mapping means "reference only", not an inferred preference.
 * Each mapping is an APPROXIMATION unless its label precisely matches the source.
 */
const TARGETS = {
  'muted-lilac': ['Colour', 'Muted lilac', 'Muted lilac'],
  'dusty-midnight-blue': ['Colour', 'Dusty midnight blue', 'Dusty midnight blue'],
  'charcoal-black': ['Colour', 'Charcoal black', 'Charcoal black'],
  'warm-grey': ['Colour', 'Warm grey', 'Warm grey'],
  'warm-terracotta': ['Colour', 'Warm terracotta', 'Warm terracotta'],
  'muted-sage-green': ['Colour', 'Muted sage green', 'Muted sage green'],
  'warm-ivory': ['Colour', 'Warm ivory', 'Warm ivory'],
  'sand-beige': ['Colour', 'Sand beige', 'Sand beige'],
  'sans': ['Typography', 'Sans-serif typography', 'sans'],
  'serif': ['Typography', 'Serif typography', 'serif'],
  'spacious': ['Layout', 'Spacious layout', 'spacious'],
  'structured': ['Layout', 'Structured layout', 'structured'],
  'dynamic': ['Layout', 'Dynamic layout', 'dynamic'],
  'botanical': ['Style', 'Organic elegance style', 'botanical'],
};

// Only precise or defensible equivalents are included. No unsupported art style
// is silently translated to a style that the catalogue does not actually render.
const SOURCE_EQUIVALENTS = {
  orbital: {
    'colour-violet-and-lilac': ['muted-lilac', 'Closest available lilac-toned palette'],
    'layout-balanced-geometry': ['structured', 'Uses the catalogue’s structured layout'],
    'typography-simple-sans-serif': ['sans', 'Direct typography equivalent'],
  },
  'blue-hour': {
    'colour-evening-blue': ['dusty-midnight-blue', 'Closest available dark-blue palette'],
    'layout-open-composition': ['spacious', 'Uses the catalogue’s spacious layout'],
  },
  citrus: {
    'layout-playful-asymmetry': ['dynamic', 'Uses the catalogue’s dynamic layout'],
  },
  forma: {
    'colour-black-and-white': ['charcoal-black', 'Closest available dark monochrome palette'],
    'layout-structured-grid': ['structured', 'Direct layout equivalent'],
  },
  ressa: {
    'layout-clean-spacing': ['spacious', 'Uses the catalogue’s spacious layout'],
  },
  'quiet-space': {
    'colour-neutral-concrete-tones': ['warm-grey', 'Closest available neutral-grey palette'],
    'layout-geometric-composition': ['structured', 'Uses the catalogue’s structured layout'],
  },
  mellow: {
    'layout-clear-visual-hierarchy': ['structured', 'Uses the catalogue’s structured layout'],
    'typography-readable-sans-serif': ['sans', 'Direct typography equivalent'],
  },
  harmony: {
    'colour-bold-orange-contrast': ['warm-terracotta', 'Closest available warm-orange palette'],
    'layout-rhythmic-composition': ['dynamic', 'Uses the catalogue’s dynamic layout'],
  },
  garden: {
    'colour-botanical-greens': ['muted-sage-green', 'Closest available botanical-green palette'],
    'decorations-leaf-motifs': ['botanical', 'Uses the botanical template’s decorative style'],
  },
  nova: {
    'layout-dynamic-composition': ['dynamic', 'Direct layout equivalent'],
  },
  nook: {
    'layout-card-based-hierarchy': ['structured', 'Uses the catalogue’s structured layout'],
  },
  terra: {
    'colour-earth-tone-palette': ['sand-beige', 'Closest available earth-toned palette'],
    'layout-relaxed-balance': ['spacious', 'Uses the catalogue’s spacious layout'],
  },
  'type-lab': {
    'colour-cream-and-dark-ink': ['warm-ivory', 'Closest available cream-toned palette'],
    'layout-layered-editorial-grid': ['structured', 'Uses the catalogue’s structured layout'],
    'typography-expressive-serif-type': ['serif', 'Uses the catalogue’s serif typography'],
  },
};

function stableId(category, value) {
  return `${category.toLowerCase()}:${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export function makeTransferOptions(artworkId, savedAttributes) {
  return savedAttributes.map((source) => {
    const match = SOURCE_EQUIVALENTS[artworkId]?.[source.id];
    if (!match) return { source, supported: false, target: null, explanation: 'Descriptive reference only; no reliable equivalent in the current design catalogue.' };
    const [key, explanation] = match;
    const targetSpec = TARGETS[key];
    if (!targetSpec) return { source, supported: false, target: null, explanation: 'No supported equivalent.' };
    const [category, label, value] = targetSpec;
    return { source, supported: true, target: { id: stableId(category, value), category, label, value }, explanation };
  });
}

export function findTransferConflict(option, projectPreferences) {
  if (!option.supported) return null;
  const existing = (projectPreferences || []).find((item) => item.id === option.target.id);
  return existing?.sentiment === 'avoid' ? existing : null;
}

/** Every preference mutation must be explicitly selected; Avoid conflicts must
 * have a per-attribute resolution. This helper also validates the final payload.
 */
export function validateTransfer({ options, selectedIds, resolutions, projectPreferences, referenceOnly = false }) {
  const supported = new Set(options.filter((o) => o.supported).map((o) => o.source.id));
  const validSelected = (selectedIds || []).filter((id) => supported.has(id));
  const unresolved = options.filter((option) => validSelected.includes(option.source.id)
    && findTransferConflict(option, projectPreferences)
    && !['keep', 'replace', 'skip'].includes(resolutions?.[option.source.id]));
  // Reference-only must be explicitly chosen; an untouched review is not consent.
  const needsChoice = validSelected.length === 0 && referenceOnly !== true;
  // These two intents are mutually exclusive. The UI clears referenceOnly when
  // an attribute is selected; this also guards against inconsistent payloads.
  const mixedChoice = validSelected.length > 0 && referenceOnly === true;
  return { validSelected, unresolved, needsChoice, mixedChoice };
}

/** Pure immutable update. Reconnecting the same artwork updates one project
 * reference rather than creating duplicate entries. Community state is not touched.
 */
export function applyInspirationTransfer(project, { artwork, savedAttributes, selectedIds = [], resolutions = {}, referenceOnly = false }) {
  const options = makeTransferOptions(artwork.id, savedAttributes);
  const currentPreferences = project.intentions.preferences;
  const { validSelected, unresolved, needsChoice, mixedChoice } = validateTransfer({ options, selectedIds, resolutions, projectPreferences: currentPreferences, referenceOnly });
  if (needsChoice) return { project, error: 'Select at least one supported attribute or explicitly choose to connect as a visual reference only.' };
  if (mixedChoice) return { project, error: 'Choose either transferable attributes or a reference-only connection.' };
  if (unresolved.length) return { project, error: `Resolve ${unresolved.length} conflicting attribute(s) before confirming.` };
  const byId = new Map(currentPreferences.map((item) => [item.id, { ...item }]));
  const changes = [];
  const applied = [];
  const kept = [];
  for (const option of options) {
    if (!validSelected.includes(option.source.id)) continue;
    const conflict = findTransferConflict(option, currentPreferences);
    const resolution = conflict ? resolutions[option.source.id] : 'apply';
    if (resolution === 'skip') continue;
    if (resolution === 'keep') {
      kept.push({ sourceId: option.source.id, targetId: option.target.id });
      continue;
    }
    const previous = byId.get(option.target.id);
    if (!previous || previous.sentiment !== 'like') {
      const next = { ...option.target, sentiment: 'like' };
      byId.set(option.target.id, next);
      changes.push({ ...next, previousSentiment: previous?.sentiment ?? null });
    }
    applied.push({ sourceId: option.source.id, targetId: option.target.id, targetLabel: option.target.label });
  }
  const reference = {
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    artworkCategory: artwork.category,
    image: artwork.image,
    sourceAttributes: savedAttributes.map((a) => ({ id: a.id, label: a.label, dimension: a.dimension })),
    transferred: applied,
    retainedExisting: kept,
  };
  const oldRefs = project.inspirationReferences || [];
  const inspirationReferences = [...oldRefs.filter((entry) => entry.artworkId !== artwork.id), reference];
  const nextMessage = {
    id: project.nextMessageId,
    role: 'prototype',
    text: `Community inspiration “${artwork.title}” was linked to this project after your confirmation. ${changes.length} confirmed preference ${changes.length === 1 ? 'change' : 'changes'} applied; ${applied.length} supported attribute ${applied.length === 1 ? 'mapping' : 'mappings'} retained. The original Community inspiration and Active Design Brief were not changed. No new designs were generated.`,
  };
  // A new project should still present its original welcome/composer until the
  // user submits an initial design brief. An inspiration-only reference should
  // not turn that untouched project into a conversation prematurely.
  const hasConversation = project.messages.length > 0;
  const messages = hasConversation ? [...project.messages, nextMessage] : project.messages;
  return {
    project: {
      ...project,
      inspirationReferences,
      intentions: { ...project.intentions, preferences: [...byId.values()] },
      // This is an immutable event in the existing conversation history.
      messages,
      nextMessageId: project.nextMessageId + (hasConversation ? 1 : 0),
    },
    summary: { reference, changes, appliedCount: applied.length, retainedCount: kept.length },
  };
}
