/**
 * Intenta Phase 3.4.1 — deterministic, conservative interaction signals.
 *
 * A signal is not a diagnosis, emotional inference, or a change to intentions.
 * Only user-submitted broad design uncertainty / rejection is eligible; the
 * ordinary exploration and attribute-feedback actions are neutral context.
 *
 * This module is intentionally framework-independent for easy unit testing.
 */
export const COMMUNITY_SIGNAL_WINDOW = 3;
export const COMMUNITY_SIGNAL_THRESHOLD = 2;
export const COMMUNITY_REPEAT_MIN_INTERACTIONS = 3;

const uncertaintyPatterns = [
  /\b(?:i\s*(?:am|'m)\s+)?not\s+sure\s+(?:what|which|how|where)\b/,
  /\b(?:i\s*(?:am|'m)\s+)?not\s+sure\s+(?:about|of)\s+(?:(?:the|my|a)\s+)?(?:overall\s+)?(?:design|direction|style|look|concept)\b/,
  /\bi\s+(?:do\s+not|don't)\s+know\s+(?:what|which|how|where)\b/,
  /\bi\s+(?:cannot|can't)\s+(?:decide|choose|make\s+up\s+my\s+mind)\b/,
  /\bi\s*(?:am|'m)\s+(?:undecided|uncertain|lost)(?=\s*(?:[.!?,;]|$)|\s+about\s+(?:(?:the|my|our)\s+)?(?:overall\s+)?(?:design|direction|style|concept)\b)/,
  /\b(?:no\s+idea|no\s+clear\s+(?:design\s+)?direction)\b/,
  /\b(?:unsure|uncertain)\s+(?:what|which|how|about\s+(?:(?:the|my)\s+)?(?:design|style|direction))\b/,
  /\bi\s*(?:am|'m)\s+(?:stuck|struggling)\s+(?:(?:with|on)\s+)?(?:the\s+)?(?:design|direction|style|concept)\b/,
];

const broadRejectionPatterns = [
  /\bi\s+(?:(?:still|really|just)\s+)*(?:don't|do\s+not)\s+like\s+(?:any|all|either)\s+of\s+(?:these|the|those)\s+(?:designs?|concepts?|directions?|options?)\b/,
  /\bi\s+(?:dislike|hate|reject)\s+(?:all|every)\s+(?:of\s+)?(?:these|the|those)\s+(?:designs?|concepts?|directions?|options?)\b/,
  /\bnone\s+of\s+(?:these|the|those)\s+(?:designs?|concepts?|directions?|options?)\s+(?:(?:really\s+)?(?:work|works|fit|fits|appeal|appeals|look|looks|feel|feels)|(?:is|are)\s+(?:right|good|suitable))\b/,
  /\bnone\s+of\s+(?:these|them)\s+(?:work|works|fit|fits|appeal|appeals|feel|feels)\b/,
  /\b(?:all|every)\s+(?:of\s+)?(?:these|the|those)\s+(?:designs?|concepts?|directions?|options?)\s+(?:are|feel|look)\s+(?:wrong|off|bad|unsuitable)\b/,
  /\b(?:nothing\s+(?:is|seems\s+to\s+be)\s+working|none\s+of\s+this\s+is\s+working)\b/,
];

export function classifyCommunitySignal(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const normalised = text.toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/\s+/g, ' ').trim();
  // Broad rejection has priority if both types appear in one message.
  if (broadRejectionPatterns.some((pattern) => pattern.test(normalised))) return 'broad-rejection';
  if (uncertaintyPatterns.some((pattern) => pattern.test(normalised))) return 'uncertainty';
  return null;
}

export function createCommunitySuggestionTracker() {
  return {
    recent: [], // At most 3 { eventKey, action, signal }; no duplicated message content.
    observedSinceSuggestion: 0,
    suggestedCount: 0,
    pending: false, // Internal eligibility only; no 3.4.1 UI and no navigation.
    lastEventKey: null,
  };
}

/**
 * Record ONE completed exploration interaction. A user can say several things
 * in a single submitted message, but that still counts as one interaction.
 * All event keys are scoped to the parent project, not to the whole app.
 *
 * `message` is the only action that can contribute a meaningful signal.
 * Other user actions count as neutral *relevant* exploration interactions.
 */
export function recordCommunityInteraction(previous, event) {
  const state = previous || createCommunitySuggestionTracker();
  if (!event || !['message', 'new-directions', 'variations', 'feedback'].includes(event.action)) return state;
  if (typeof event.eventKey !== 'string' || !event.eventKey) return state;
  if (state.pending || state.lastEventKey === event.eventKey) return state;

  const signal = event.action === 'message' ? classifyCommunitySignal(event.text) : null;
  const recent = [...state.recent, { eventKey: event.eventKey, action: event.action, signal }]
    .slice(-COMMUNITY_SIGNAL_WINDOW);
  const observedSinceSuggestion = state.observedSinceSuggestion + 1;
  const signals = recent.filter((item) => item.signal !== null).length;
  const enoughFreshInteractions = state.suggestedCount === 0 ||
    observedSinceSuggestion >= COMMUNITY_REPEAT_MIN_INTERACTIONS;

  return {
    ...state,
    recent,
    observedSinceSuggestion,
    lastEventKey: event.eventKey,
    pending: enoughFreshInteractions && signals >= COMMUNITY_SIGNAL_THRESHOLD,
  };
}

/** Reserved for 3.4.2: call only when an inline suggestion is actually inserted. */
export function markCommunitySuggestionShown(previous) {
  const state = previous || createCommunitySuggestionTracker();
  if (!state.pending) return state;
  return {
    ...state,
    recent: [],
    observedSinceSuggestion: 0,
    suggestedCount: state.suggestedCount + 1,
    pending: false,
    lastEventKey: null,
  };
}

/** Reset when a user explicitly completes an exploration (e.g. approves a design). */
export function resetCommunityObservation(previous) {
  const state = previous || createCommunitySuggestionTracker();
  return { ...state, recent: [], observedSinceSuggestion: 0, pending: false, lastEventKey: null };
}

/** Project-specific wrapper: no writes to messages, brief, preferences, or other projects. */
export function trackProjectCommunityInteraction(project, event) {
  return {
    ...project,
    exploration: {
      ...project.exploration,
      communitySuggestionTracker: recordCommunityInteraction(
        project.exploration.communitySuggestionTracker, event
      ),
    },
  };
}
