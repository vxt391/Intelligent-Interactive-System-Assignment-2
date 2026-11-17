/** Clear the current Edit-mode selection after clicking blank canvas workspace.
 * Never alter the working design, pointers, or pending proposals. */
export function deselectRefinementOnBoard(draft) {
  if (!draft || draft.toolMode === 'point' || draft.pendingProposal || !draft.selectedIds?.length) return draft;
  return { ...draft, selectedIds: [] };
}
