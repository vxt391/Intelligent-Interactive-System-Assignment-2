/**
 * Milestone 5.3: Approval is independent of a provisional selection and of
 * confirmed attribute preferences. Only explicit confirmation uses this helper.
 * All values are plain serialisable data in the in-memory React prototype.
 */
export function getDesignConcept(messages, messageId, conceptId) {
  if (messageId == null || conceptId == null) return null;
  const recommendation = messages.find((message) =>
    message.role === 'recommendations' && message.id === messageId
  );
  if (!recommendation) return null;
  const concept = recommendation.concepts.find((item) => item.id === conceptId);
  return concept ? { recommendation, concept } : null;
}

export function approveDesignProject(project) {
  if (!project.approvalRequest || project.explorationComplete) return project;
  const { messageId, conceptId } = project.approvalRequest;
  const found = getDesignConcept(project.messages, messageId, conceptId);
  if (!found) return { ...project, approvalRequest: null };

  // Snapshot the complete CSS-preview concept, including any array-valued
  // variation metadata. Previous rounds and past approvals stay untouched.
  const snapshot = JSON.parse(JSON.stringify(found.concept));
  const approvedDesign = {
    conceptId: snapshot.id,
    messageId,
    round: found.recommendation.round || 1,
    concept: snapshot,
    approvalMessageId: project.nextMessageId,
  };

  return {
    ...project,
    approvedDesign,
    approvalRequest: null,
    explorationComplete: true,
    messages: [...project.messages, {
      id: project.nextMessageId,
      role: 'design-approved',
      approvedDesign: JSON.parse(JSON.stringify(approvedDesign)),
    }],
    nextMessageId: project.nextMessageId + 1,
    // Do NOT modify project.intentions, feedbackDrafts or selected concept.
  };
}
