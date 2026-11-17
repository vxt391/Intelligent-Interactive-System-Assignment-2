import { normaliseRefinementRotation } from './refinementRotation.js';
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

// Object duplication and deletion are working-copy-only edits. Base objects are
// hidden rather than removed so template migrations cannot recreate deleted
// marks/dividers. Dynamic duplicates are removed entirely when deleted.
export function refinementObjectKind(id, object) {
  return object?.kind || String(id).replace(/-copy-\d+$/, '');
}

function validSelectedIds(ids, working) {
  return (ids || []).filter((id) => id === 'background' || Boolean(working.objects?.[id] && working.objects[id].visible !== false));
}

function validPointers(pointers, working) {
  return (pointers || []).filter((pointer) => pointer.objectId === 'background' || Boolean(working.objects?.[pointer.objectId] && working.objects[pointer.objectId].visible !== false));
}

function historySnapshot(draft) {
  return {
    working: JSON.parse(JSON.stringify(draft.working)),
    selectedIds: [...(draft.selectedIds || [])],
    pointers: JSON.parse(JSON.stringify(draft.pointers || [])),
  };
}

export function editRefinement(project, operation) {
  const draft = project.refinement;
  if (!draft || !operation || draft.pendingProposal) return project;
  const snapshot = historySnapshot(draft);
  const working = JSON.parse(JSON.stringify(ensureMovableDesignDetails(draft.working)));
  const ids = validSelectedIds(draft.selectedIds, working);
  let selectedIds = ids;
  let pointers = draft.pointers || [];

  if (operation.key === 'duplicate' || operation.key === 'delete') {
    const targets = [...new Set((operation.ids || ids).filter((id) =>
      id !== 'background' && working.objects[id] && working.objects[id].visible !== false))];
    if (!targets.length) return project;
    if (operation.key === 'delete') {
      for (const id of targets) {
        if (working.objects[id].kind) delete working.objects[id];
        else working.objects[id].visible = false;
      }
      selectedIds = ids.filter((id) => !targets.includes(id));
      pointers = pointers.filter((p) => !targets.includes(p.objectId));
    } else {
      const created = [];
      for (const id of targets) {
        const source = working.objects[id];
        const kind = refinementObjectKind(id, source);
        let i = 1;
        while (working.objects[`${kind}-copy-${i}`]) i += 1;
        const copyId = `${kind}-copy-${i}`;
        working.objects[copyId] = {
          ...source, kind,
          x: Math.round(Math.min(kind === 'mark' ? 98 : 92, Math.max(2, source.x + (source.x > 80 ? -4 : 4))) * 10) / 10,
          y: Math.round(Math.min(92, Math.max(8, source.y + 4)) * 10) / 10,
        };
        created.push(copyId);
      }
      selectedIds = created;
    }
  } else {
    if (operation.key === 'background' && ids.includes('background')) working.background = operation.value;
    if (['color', 'size'].includes(operation.key)) ids.forEach((id) => {
      if (working.objects[id]) working.objects[id][operation.key] = operation.value;
    });
    // Rotation may be absolute (angle input / canvas handle) or relative
    // (15-degree nudges). A batch of selected elements is one Undo step.
    if (operation.key === 'rotation' || operation.key === 'rotationDelta') {
      const targets = operation.id ? [operation.id] : ids;
      const amount = Number(operation.value);
      if (operation.value !== '' && operation.value != null && Number.isFinite(amount)) {
        for (const id of targets) {
          const object = working.objects[id];
          if (!object || object.visible === false || !ids.includes(id)) continue;
          const angle = normaliseRefinementRotation(operation.key === 'rotationDelta'
            ? normaliseRefinementRotation(object.rotation) + amount : amount);
          // Don't create a history entry merely by resetting an untouched 0° object.
          if (angle !== normaliseRefinementRotation(object.rotation)) object.rotation = angle;
        }
      }
    }
    if (operation.key === 'position' && working.objects[operation.id] && operation.value) {
      const target = working.objects[operation.id];
      const x = Number(operation.value.x);
      const y = Number(operation.value.y);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        target.x = Math.round(Math.min(refinementObjectKind(operation.id, target) === 'mark' ? 98 : 92, Math.max(2, x)) * 10) / 10;
        target.y = Math.round(Math.min(92, Math.max(8, y)) * 10) / 10;
      }
    }
    if (operation.key === 'visibility' && operation.id && working.objects[operation.id]) {
      working.objects[operation.id].visible = Boolean(operation.value);
      if (!operation.value) {
        selectedIds = ids.filter((id) => id !== operation.id);
        pointers = pointers.filter((p) => p.objectId !== operation.id);
      }
    }
    if (operation.key === 'text' && ids.length === 1 && working.objects[ids[0]]) {
      working.objects[ids[0]].text = operation.value;
    }
  }
  if (JSON.stringify(working) === JSON.stringify(draft.working)) return project;
  return { ...project, refinement: {
    ...draft,
    working,
    selectedIds,
    pointers,
    history: [...(draft.history || []).slice(-19), snapshot],
    future: [], // A new edit creates a new branch and invalidates Redo.
  } };
}

export function undoRefinement(project) {
  const draft = project.refinement;
  if (!draft?.history?.length || draft.pendingProposal) return project;
  const last = draft.history[draft.history.length - 1];
  const working = ensureMovableDesignDetails(JSON.parse(JSON.stringify(last.working)));
  return { ...project, refinement: {
    ...draft,
    working,
    selectedIds: validSelectedIds(last.selectedIds ?? draft.selectedIds, working),
    pointers: validPointers(last.pointers ?? draft.pointers, working),
    history: draft.history.slice(0, -1),
    future: [...(draft.future || []).slice(-19), historySnapshot(draft)],
  } };
}

export function redoRefinement(project) {
  const draft = project.refinement;
  if (!draft?.future?.length || draft.pendingProposal) return project;
  const next = draft.future[draft.future.length - 1];
  const working = ensureMovableDesignDetails(JSON.parse(JSON.stringify(next.working)));
  return { ...project, refinement: {
    ...draft,
    working,
    selectedIds: validSelectedIds(next.selectedIds ?? draft.selectedIds, working),
    pointers: validPointers(next.pointers ?? draft.pointers, working),
    history: [...(draft.history || []).slice(-19), historySnapshot(draft)],
    future: draft.future.slice(0, -1),
  } };
}
