import { getDesignConcept } from './designApproval.js';

export function resolveRefinementConcept(project, preferApproved = false) {
  const selected = getDesignConcept(
    project.messages,
    project.exploration?.selectedConceptMessageId,
    project.exploration?.selectedConceptId,
  );
  if (preferApproved && project.approvedDesign?.concept) {
    return {
      concept: project.approvedDesign.concept,
      messageId: project.approvedDesign.messageId,
      approved: true,
    };
  }
  if (selected) return { concept: selected.concept, messageId: selected.recommendation.id, approved: false };
  if (project.approvedDesign?.concept) {
    return {
      concept: project.approvedDesign.concept,
      messageId: project.approvedDesign.messageId,
      approved: true,
    };
  }
  return null;
}

/**
 * Derive the EDITABLE composition from the same concept tokens used by
 * BusinessCardPreview: brand, palette, typography, styleId, and layout.
 * Coordinates are card-relative (%). Sizes are design units at a 690px-wide
 * canvas; the renderer uses container units so proportions remain consistent
 * with the small original reference at other display scales.
 *
 * Contact information is intentionally not shown in the source template.
 * Users may explicitly add it while refining; we must not invent a contact
 * line and falsely present it as part of the original recommendation.
 */
export function makeRefinementComposition(concept) {
  const foreground = concept.foreground || '#26374c';
  const accent = concept.accent || '#8aa3ba';
  const styleId = ['minimal', 'botanical', 'expressive'].includes(concept.styleId)
    ? concept.styleId : 'minimal';
  const layout = ['structured', 'dynamic', 'spacious'].includes(concept.layout)
    ? concept.layout : 'structured';
  const rightAligned = layout === 'dynamic';
  const brandMark = styleId === 'botanical' ? '✳' : styleId === 'minimal' ? '◩' : '✦';
  return {
    background: concept.background || '#e5eaf0',
    foreground,
    typography: concept.typography || 'sans',
    styleId,
    layout,
    brandMark,
    objects: {
      logo: {
        text: concept.brand || 'STUDIO', x: 5.2, y: 16,
        color: foreground, size: styleId === 'expressive' ? 75 : 63,
      },
      // Previously these were separate, fixed-position DOM elements and could
      // not be dragged. Make them normal editable canvas objects instead.
      mark: { text: brandMark, x: 94.8, y: 8.3, color: foreground, size: 54 },
      ...(layout === 'structured' ? { divider: { text: '', x: 5.2, y: 73.6, color: foreground, size: 618, shape: 'line' } } : {}),
      name: {
        text: 'ALEX MORGAN', x: rightAligned ? 94.8 : 5.2, y: 83.5,
        color: foreground, size: 24,
      },
      job: {
        text: concept.role || 'DESIGNER', x: rightAligned ? 94.8 : 5.2, y: 91,
        color: foreground, size: 21,
      },
      contact: {
        text: 'alex@studio.com · +44 7700 900000', x: 5.2, y: 62,
        color: foreground, size: 16, visible: false,
      },
      decorations: {
        text: '', x: styleId === 'minimal' ? 97.9 : styleId === 'expressive' ? 89 : 96,
        y: styleId === 'minimal' ? 50 : styleId === 'expressive' ? 9 : 81,
        color: accent, size: styleId === 'minimal' ? 28 : styleId === 'expressive' ? 390 : 285,
        shape: styleId === 'minimal' ? 'stripe' : styleId === 'expressive' ? 'circle' : 'leaf',
      },
    },
  };
}

/** Upgrade pre-fix, session-only drafts without resetting user edits.
 *  Idempotent: unchanged drafts return their original object identity.
 */
export function ensureMovableDesignDetails(working) {
  if (!working?.objects) return working;
  const needsMark = !working.objects.mark;
  const needsDivider = working.layout === 'structured' && !working.objects.divider;
  if (!needsMark && !needsDivider) return working;
  const mark = working.brandMark || (working.styleId === 'botanical' ? '✳' : working.styleId === 'expressive' ? '✦' : '◩');
  return {
    ...working,
    objects: {
      ...working.objects,
      ...(needsMark ? { mark: { text: mark, x: 94.8, y: 8.3, color: working.objects.logo?.color || working.foreground, size: 54 } } : {}),
      ...(needsDivider ? { divider: { text: '', x: 5.2, y: 73.6, color: working.foreground, size: 618, shape: 'line' } } : {}),
    },
  };
}

export function createRefinementDraft(found) {
  if (!found?.concept) return null;
  const concept = JSON.parse(JSON.stringify(found.concept));
  return {
    source: { messageId: found.messageId, conceptId: concept.id, approvedAtEntry: found.approved },
    original: concept,
    working: makeRefinementComposition(concept),
    selectedIds: [],
    toolMode: 'edit',
    pointers: [],
    nextPointerId: 1,
    promptDraft: '',
    refinementMessages: [],
    nextRefinementMessageId: 1,
    referencesOpen: false,
    zoom: 100,
    history: [],
    future: [],
  };
}

export function enterRefinement(project, preferApproved = false) {
  const found = resolveRefinementConcept(project, preferApproved);
  if (!found) return { ...project, mode: 'refine' }; // Honest empty state; cannot fabricate a concept.
  const sameSource = project.refinement?.source?.conceptId === found.concept.id
    && project.refinement?.source?.messageId === found.messageId;
  return {
    ...project,
    mode: 'refine',
    refinement: sameSource ? {
      ...project.refinement,
      working: ensureMovableDesignDetails(project.refinement.working),
    } : createRefinementDraft(found),
  };
}

export function editRefinement(project, operation) {
  const draft = project.refinement;
  if (!draft || !operation) return project;
  const snapshot = { working: JSON.parse(JSON.stringify(draft.working)) };
  const working = JSON.parse(JSON.stringify(ensureMovableDesignDetails(draft.working)));
  const ids = (draft.selectedIds || []).filter((id) => id === 'background' || working.objects[id]);
  if (operation.key === 'background' && ids.includes('background')) working.background = operation.value;
  if (['color', 'size'].includes(operation.key)) ids.forEach((id) => {
    if (working.objects[id]) working.objects[id][operation.key] = operation.value;
  });
  if (operation.key === 'position' && working.objects[operation.id] && operation.value) {
    const target = working.objects[operation.id];
    const x = Number(operation.value.x);
    const y = Number(operation.value.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      target.x = Math.round(Math.min(operation.id === 'mark' ? 98 : 92, Math.max(2, x)) * 10) / 10;
      target.y = Math.round(Math.min(92, Math.max(8, y)) * 10) / 10;
    }
  }
  if (operation.key === 'visibility' && operation.id && working.objects[operation.id]) {
    working.objects[operation.id].visible = Boolean(operation.value);
  }
  if (operation.key === 'text' && ids.length === 1 && working.objects[ids[0]]) {
    working.objects[ids[0]].text = operation.value;
  }
  if (JSON.stringify(working) === JSON.stringify(draft.working)) return project;
  return { ...project, refinement: {
    ...draft,
    working,
    selectedIds: operation.key === 'visibility' && operation.value === false
      ? (draft.selectedIds || []).filter((id) => id !== operation.id) : draft.selectedIds,
    history: [...(draft.history || []).slice(-19), snapshot],
    future: [], // A new edit creates a new branch and invalidates Redo.
  } };
}

export function undoRefinement(project) {
  const draft = project.refinement;
  if (!draft?.history?.length) return project;
  const last = draft.history[draft.history.length - 1];
  const current = { working: JSON.parse(JSON.stringify(draft.working)) };
  return { ...project, refinement: {
    ...draft,
    working: ensureMovableDesignDetails(JSON.parse(JSON.stringify(last.working))),
    history: draft.history.slice(0, -1),
    future: [...(draft.future || []).slice(-19), current],
  } };
}

export function redoRefinement(project) {
  const draft = project.refinement;
  if (!draft?.future?.length) return project;
  const next = draft.future[draft.future.length - 1];
  const current = { working: JSON.parse(JSON.stringify(draft.working)) };
  return { ...project, refinement: {
    ...draft,
    working: ensureMovableDesignDetails(JSON.parse(JSON.stringify(next.working))),
    history: [...(draft.history || []).slice(-19), current],
    future: draft.future.slice(0, -1),
  } };
}
