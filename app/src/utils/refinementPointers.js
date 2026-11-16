// Phase 4.2 — deterministic, project-local pointer annotations and request records.
// No AI edit is executed here: requests are retained for the Phase 4.3 preview flow.
export const REFINEMENT_OBJECT_LABELS = Object.freeze({
  background: 'Background',
  logo: 'Logo / brand',
  mark: 'Brand symbol',
  divider: 'Divider line',
  name: 'Name',
  job: 'Job title',
  contact: 'Contact information',
  decorations: 'Decorations',
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normaliseCardPoint(x, y) {
  return {
    x: Math.round(clamp(Number.isFinite(Number(x)) ? Number(x) : 50, 0, 100) * 10) / 10,
    y: Math.round(clamp(Number.isFinite(Number(y)) ? Number(y) : 50, 0, 100) * 10) / 10,
  };
}

export function addRefinementPointer(draft, { x, y, objectId = 'background' }) {
  if (!draft?.working) return draft;
  const known = objectId === 'background' || Boolean(draft.working.objects?.[objectId]);
  const targetId = known ? objectId : 'background';
  const id = draft.nextPointerId || 1;
  const position = normaliseCardPoint(x, y);
  return {
    ...draft,
    pointers: [...(draft.pointers || []), {
      id: `pointer-${id}`,
      ...position,
      objectId: targetId,
      label: REFINEMENT_OBJECT_LABELS[targetId] || 'Background',
    }],
    nextPointerId: id + 1,
  };
}

export function removeRefinementPointer(draft, pointerId) {
  if (!draft) return draft;
  return { ...draft, pointers: (draft.pointers || []).filter((p) => p.id !== pointerId) };
}

export function clearRefinementPointers(draft) {
  if (!draft) return draft;
  return { ...draft, pointers: [] };
}

export function recordRefinementRequest(draft) {
  if (!draft?.working || !draft.promptDraft?.trim()) return draft;
  const id = draft.nextRefinementMessageId || 1;
  const explicitPointers = draft.pointers || [];
  const selectedObjects = draft.toolMode === 'edit' && !explicitPointers.length
    ? (draft.selectedIds || []).filter((selected) => selected === 'background' || Boolean(draft.working.objects[selected]))
    : [];
  const requestPins = explicitPointers.length ? explicitPointers : selectedObjects.map((selected) => {
    const object = draft.working.objects[selected];
    return {
      id: `object-${selected}`,
      x: object ? object.x : 50,
      y: object ? object.y : 50,
      objectId: selected,
      label: REFINEMENT_OBJECT_LABELS[selected],
    };
  });
  const targets = requestPins.map((p, index) => ({
    number: index + 1,
    pointerId: p.id,
    x: p.x,
    y: p.y,
    objectId: p.objectId,
    label: p.label,
  }));
  return {
    ...draft,
    refinementMessages: [...(draft.refinementMessages || []), {
      id: `request-${id}`,
      text: draft.promptDraft.trim(),
      targets,
      status: 'recorded', // Deliberately not 'applied' or 'generated'.
    }],
    nextRefinementMessageId: id + 1,
    promptDraft: '',
    pointers: [],
  };
}
