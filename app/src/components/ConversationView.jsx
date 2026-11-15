import { useEffect, useRef, useState } from 'react';
import ConceptRecommendations from './ConceptRecommendations';
import VariationDialog from './VariationDialog';
import ContinueExploringDialog from './ContinueExploringDialog';

export default function ConversationView({
  messages,
  composer,
  selectedConceptId,
  selectedConceptMessageId,
  onSelectConcept,
  feedbackDrafts,
  onExploreNewDirections,
  onStartVariations,
  onToggleVariationDimension,
  onPrepareVariations,
  onResolveVariationConflict,
  onContinueVariationsWithoutFeedback,
  onCancelVariations,
  variationRequest,
  onToggleDraftAttribute,
  onRateDraftAttribute,
  onRemoveDraftAttribute,
  onConfirmDraftPreferences,
}) {
  const feedRef = useRef(null);
  const [exploreDialogOpen, setExploreDialogOpen] = useState(false);
  const [expandedFeedbackRounds, setExpandedFeedbackRounds] = useState({});
  const [scrollFeedbackId, setScrollFeedbackId] = useState(null);
  const recommendationMessages = messages.filter((message) => message.role === 'recommendations');
  const draftRounds = recommendationMessages.filter((message) =>
    (feedbackDrafts[message.id]?.items.length ?? 0) > 0
  );
  const pendingCount = draftRounds.reduce((count, message) =>
    count + feedbackDrafts[message.id].items.length, 0
  );
  const selectedRound = recommendationMessages.find((item) =>
    item.id === selectedConceptMessageId && item.concepts.some((c) => c.id === selectedConceptId)
  );
  const selectedConcept = selectedRound?.concepts.find((item) => item.id === selectedConceptId);
  const variationRound = recommendationMessages.find((item) => item.id === variationRequest?.messageId);
  const variationConcept = variationRound?.concepts.find((item) => item.id === variationRequest?.conceptId);
  const variationReference = variationConcept ? { concept: variationConcept, round: variationRound.round || 1 } : null;


  function toggleFeedback(messageId) {
    setExpandedFeedbackRounds((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  }

  function reviewUnfinishedFeedback() {
    const newestDraftRound = draftRounds[draftRounds.length - 1];
    if (!newestDraftRound) return;
    setExpandedFeedbackRounds((current) => ({ ...current, [newestDraftRound.id]: true }));
    setScrollFeedbackId(newestDraftRound.id);
  }

  useEffect(() => {
    if (!feedRef.current) return;
    // On the first submission, keep the three concept cards visible from the top.
    // Later messages should scroll into view normally.
    feedRef.current.scrollTop = messages.length <= 2 ? 0 : feedRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (scrollFeedbackId === null || !expandedFeedbackRounds[scrollFeedbackId]) return;
    const target = [...(feedRef.current?.querySelectorAll('[data-feedback-for]') ?? [])]
      .find((element) => Number(element.dataset.feedbackFor) === scrollFeedbackId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollFeedbackId(null);
    }
  }, [scrollFeedbackId, expandedFeedbackRounds]);

  return (
    <section className="conversation-view" aria-label="Design conversation">
      <div
        className="conversation-feed"
        ref={feedRef}
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
      >
        <div className="conversation-heading">
          <span className="eyebrow">IDEA EXPLORATION</span>
          <h1>Your design conversation</h1>
          <p>Earlier requests remain available as your ideas evolve.</p>
        </div>

        {messages.map((message) => (
          <div
            className={`conversation-row ${message.role === 'user' ? 'from-user' : 'from-prototype'} ${message.role === 'recommendations' ? 'recommendation-row' : ''}`}
            key={message.id}
            data-recommendation-id={message.role === 'recommendations' ? message.id : undefined}
          >
            {message.role !== 'user' && (
              <span className="conversation-avatar" aria-hidden="true">✳</span>
            )}
            <div className="conversation-message">
              <span className="conversation-speaker">
                {message.role === 'user'
                  ? 'You'
                  : message.role === 'recommendations'
                    ? `Intenta · Design concepts · Round ${message.round ?? 1}`
                    : message.role === 'preferences-confirmed'
                      ? 'Intenta · Preferences confirmed'
                      : message.role === 'preferences-edited'
                        ? 'Intenta · Preferences updated'
                      : 'Prototype notice'}
              </span>

              {message.role === 'recommendations' ? (
                <ConceptRecommendations
                  recommendation={{ ...message, messageId: message.id }}
                  selectedConceptId={selectedConceptMessageId === message.id ? selectedConceptId : null}
                  onSelectConcept={onSelectConcept}
                  feedbackDraft={feedbackDrafts[message.id]?.items ?? []}
                  feedbackExpanded={Boolean(expandedFeedbackRounds[message.id])}
                  onToggleFeedback={toggleFeedback}
                  onToggleDraftAttribute={onToggleDraftAttribute}
                  onRateDraftAttribute={(id, sentiment) => onRateDraftAttribute(message.id, id, sentiment)}
                  onRemoveDraftAttribute={(id) => onRemoveDraftAttribute(message.id, id)}
                  onConfirmDraftPreferences={(roundId) => {
                    const items = feedbackDrafts[roundId]?.items ?? [];
                    onConfirmDraftPreferences(roundId);
                    // Keep the panel open if unrated items remain; otherwise return
                    // to the compact view after successful confirmation.
                    if (items.length > 0 && items.every((item) => item.sentiment !== null)) {
                      setExpandedFeedbackRounds((current) => ({ ...current, [roundId]: false }));
                    }
                  }}
                />
              ) : message.role === 'preferences-edited' ? (
                <div className="preference-confirmation" aria-label="Saved preference edits">
                  <p className="preference-confirmation-intro">
                    Your changes to Current Intentions have been saved.
                  </p>
                  <ul className="preference-confirmation-list">
                    {message.changes.map((change) => (
                      <li key={change.id}>
                        {change.action === 'removed' ? (
                          <span className="preference-sentiment preference-sentiment-removed">Removed</span>
                        ) : (
                          <span className={`preference-sentiment preference-sentiment-${change.sentiment}`}>
                            {change.sentiment === 'like' ? 'Like' : change.sentiment === 'avoid' ? 'Avoid' : 'Not sure'}
                          </span>
                        )}
                        <span>{change.label}</span>
                        {change.action === 'updated' && (
                          <span className="preference-previous">(previously {change.previousSentiment})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="preference-confirmation-note">
                    Earlier decisions remain in conversation history; Current Intentions shows the latest saved state.
                  </p>
                </div>
              ) : message.role === 'preferences-confirmed' ? (
                <div className="preference-confirmation" aria-label="Confirmed preference changes">
                  <p className="preference-confirmation-intro">
                    Your feedback has been confirmed and added to Current Intentions.
                  </p>
                  <ul className="preference-confirmation-list">
                    {message.changes.map((change) => (
                      <li key={change.id}>
                        <span className={`preference-sentiment preference-sentiment-${change.sentiment}`}>
                          {change.sentiment === 'like' ? 'Like' : change.sentiment === 'avoid' ? 'Avoid' : 'Not sure'}
                        </span>
                        <span>{change.label}</span>
                        {change.previousSentiment && change.previousSentiment !== change.sentiment && (
                          <span className="preference-previous">(previously {change.previousSentiment})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="preference-confirmation-note">
                    Only confirmed Like and Avoid preferences will guide later recommendation rounds.
                    Not sure stays visible but does not constrain the results.
                  </p>
                </div>
              ) : (
                <>
                  <p>{message.text}</p>
                  {message.role === 'user' && message.promptMeta?.submission === 'suggested' && (
                    <details className="conversation-original-details">
                      <summary>Submitted with assistance · View original wording</summary>
                      <p>{message.promptMeta.original}</p>
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="conversation-composer">
        {recommendationMessages.length > 0 && (
          <section className="new-directions-controls simplified-exploration-controls" aria-label="Continue design exploration">
            <div className="new-directions-intro">
              <div>
                <strong>Ready to continue?</strong>
                <p>Choose new directions or variations in one simple step.</p>
              </div>
              <button type="button" className="new-directions-button" onClick={() => setExploreDialogOpen(true)}>
                Continue Exploring
              </button>
            </div>
            {selectedConcept && (
              <p className="variation-selected-hint">
                Selected: Round {selectedRound.round || 1} · {selectedConcept.name}
              </p>
            )}
          </section>
        )}
        <p className="conversation-compose-title">Or continue with a prompt</p>
        {composer}
        <p className="conversation-compose-note">
          Concepts are simulated CSS designs. Saved preferences guide new directions; variations use a selected reference.
        </p>
      </div>
      {exploreDialogOpen && !variationRequest && (
        <ContinueExploringDialog
          selectedConcept={selectedConcept}
          selectedRound={selectedRound}
          pendingCount={pendingCount}
          pendingRoundCount={draftRounds.length}
          onExploreNewDirections={onExploreNewDirections}
          onStartVariations={onStartVariations}
          onReviewFeedback={reviewUnfinishedFeedback}
          onClose={() => setExploreDialogOpen(false)}
        />
      )}
      {variationRequest && (
        <VariationDialog
          request={variationRequest}
          reference={variationReference}
          pendingCount={pendingCount}
          pendingRoundCount={draftRounds.length}
          onToggleDimension={onToggleVariationDimension}
          onPrepare={onPrepareVariations}
          onResolveConflict={onResolveVariationConflict}
          onCancel={onCancelVariations}
          onContinueWithoutFeedback={onContinueVariationsWithoutFeedback}
          onReviewFeedback={() => {
            onCancelVariations();
            reviewUnfinishedFeedback();
          }}
        />
      )}
    </section>
  );
}
