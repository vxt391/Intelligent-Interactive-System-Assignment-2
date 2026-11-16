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

export function createRefinementDraft(found) {
  if (!found?.concept) return null;
  const concept = JSON.parse(JSON.stringify(found.concept));
  const light = concept.foreground || '#26374c';
  const accent = concept.accent || '#8aa3ba';
  return {
    source: { messageId: found.messageId, conceptId: concept.id, approvedAtEntry: found.approved },
    original: concept,
    working: {
      background: concept.background || '#e5eaf0',
      objects: {
        logo: { text: `${concept.brand || 'STUDIO'}  ${concept.styleId === 'botanical' ? '✳' : concept.styleId === 'minimal' ? '◩' : '✦'}`, x: 9, y: 12, color: light, size: 19 },
        name: { text: 'ALEX MORGAN', x: 9, y: 47, color: light, size: 29 },
        job: { text: concept.role || 'DESIGNER', x: 9, y: 68, color: light, size: 13 },
        contact: { text: 'alex@studio.com  ·  +44 7700 900000', x: 9, y: 84, color: light, size: 10 },
        decorations: { text: '●', x: 85, y: 15, color: accent, size: 54 },
      },
      typography: concept.typography,
    },
    selectedIds: [],
    referencesOpen: false,
    history: [],
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
    refinement: sameSource ? project.refinement : createRefinementDraft(found),
  };
}

export function editRefinement(project, operation) {
  const draft = project.refinement;
  if (!draft || !operation) return project;
  const snapshot = { working: JSON.parse(JSON.stringify(draft.working)) };
  const working = JSON.parse(JSON.stringify(draft.working));
  const ids = (draft.selectedIds || []).filter((id) => id === 'background' || working.objects[id]);
  if (operation.key === 'background' && ids.includes('background')) working.background = operation.value;
  if (['color', 'size'].includes(operation.key)) ids.forEach((id) => {
    if (working.objects[id]) working.objects[id][operation.key] = operation.value;
  });
  if (operation.key === 'text' && ids.length === 1 && working.objects[ids[0]]) {
    working.objects[ids[0]].text = operation.value;
  }
  if (JSON.stringify(working) === JSON.stringify(draft.working)) return project;
  return { ...project, refinement: {
    ...draft,
    working,
    history: [...(draft.history || []).slice(-19), snapshot],
  } };
}

export function undoRefinement(project) {
  const draft = project.refinement;
  if (!draft?.history?.length) return project;
  const last = draft.history[draft.history.length - 1];
  return { ...project, refinement: { ...draft, working: last.working, history: draft.history.slice(0, -1) } };
}
