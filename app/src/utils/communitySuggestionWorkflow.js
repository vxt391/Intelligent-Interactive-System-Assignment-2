/**
 * Phase 3.4.2: turn verified eligibility into one explicitly actionable
 * conversation event. This is intentionally a pure project-state update.
 * Each event belongs to one project; nothing is generated or navigated automatically.
 */
import {
  markCommunitySuggestionShown,
  trackProjectCommunityInteraction,
} from './communitySuggestionRules.js';

export const COMMUNITY_SUGGESTION_ROLE = 'community-suggestion';

export function trackAndOfferCommunitySuggestion(project, event) {
  // Don't stack another actionable suggestion while the previous one is open.
  // Interactions still appear in conversation; only the trigger window pauses.
  if (project.messages.some((m) => m.role === COMMUNITY_SUGGESTION_ROLE && m.status === 'active')) {
    return project;
  }
  const tracked = trackProjectCommunityInteraction(project, event);
  const eligibility = tracked.exploration.communitySuggestionTracker;
  if (!eligibility.pending) return tracked;
  const tracker = markCommunitySuggestionShown(eligibility);
  return {
    ...tracked,
    messages: [...tracked.messages, {
      id: tracked.nextMessageId,
      role: COMMUNITY_SUGGESTION_ROLE,
      status: 'active',
    }],
    nextMessageId: tracked.nextMessageId + 1,
    exploration: { ...tracked.exploration, communitySuggestionTracker: tracker },
  };
}

/** Explicit action only: retain the historical message but remove its buttons. */
export function resolveCommunitySuggestion(project, messageId, status) {
  if (!['dismissed', 'used'].includes(status)) return project;
  if (!project.messages.some((m) => m.id === messageId &&
    m.role === COMMUNITY_SUGGESTION_ROLE && m.status === 'active')) return project;
  return {
    ...project,
    messages: project.messages.map((m) =>
      m.id === messageId && m.role === COMMUNITY_SUGGESTION_ROLE
        ? { ...m, status } : m),
  };
}

/** Visiting Community through the sidebar also consumes an open suggestion. */
export function markActiveCommunitySuggestionsUsed(project) {
  if (!project.messages.some((m) => m.role === COMMUNITY_SUGGESTION_ROLE && m.status === 'active')) {
    return project;
  }
  return {
    ...project,
    messages: project.messages.map((m) => m.role === COMMUNITY_SUGGESTION_ROLE && m.status === 'active'
      ? { ...m, status: 'used' } : m),
  };
}
