/** Pure project-gallery status and navigation; deliberately independent of React. */
export function projectStage(project) {
  if (project.refinement?.working) return 'Refining';
  if (project.exploration?.selectedConceptId || project.approvedDesign) return 'Concept selected';
  if (project.messages?.length) return 'Exploring';
  return 'New';
}

export function projectResumeMode(project) {
  return project.mode === 'refine' && project.refinement?.working ? 'refine' : 'explore';
}


/**
 * Permanently remove one saved project, including its open tab and any
 * project-specific Community navigation notices. This deliberately does not
 * delete independently saved Community inspiration.
 *
 * Pure function so the App can update React state and browser storage together.
 */
export function deleteSavedProject({ projects, openProjectIds, activeId, communityReturnProjectId, communityState }, targetId) {
  if (!projects.some((project) => project.id === targetId)) {
    return { deleted: false, projects, openProjectIds, activeId, communityReturnProjectId, communityState };
  }

  const remainingProjects = projects.filter((project) => project.id !== targetId);
  const existingIds = new Set(remainingProjects.map((project) => project.id));
  const remainingOpenIds = [...new Set(openProjectIds.filter((id) => id !== targetId && existingIds.has(id)))];
  const nextActiveId = activeId === targetId || !existingIds.has(activeId)
    ? (remainingOpenIds.at(-1) ?? null)
    : activeId;
  const nextReturnId = communityReturnProjectId === targetId ? null : communityReturnProjectId;

  let nextCommunityState = communityState;
  if (communityState && typeof communityState === 'object') {
    const updates = {};
    if (communityState.connectionNotice?.projectId === targetId) updates.connectionNotice = null;
    if (communityState.transferRequest?.targetProjectId === targetId) updates.transferRequest = null;
    if (Object.keys(updates).length) nextCommunityState = { ...communityState, ...updates };
  }
  return {
    deleted: true,
    projects: remainingProjects,
    openProjectIds: remainingOpenIds,
    activeId: nextActiveId,
    communityReturnProjectId: nextReturnId,
    communityState: nextCommunityState,
  };
}
