import { useEffect, useRef, useState } from 'react';
import ConceptRecommendations from './ConceptRecommendations';
import VariationDialog from './VariationDialog';
import ContinueExploringDialog from './ContinueExploringDialog';
import ConfirmDesignDialog from './ConfirmDesignDialog';
import BusinessCardPreview from './BusinessCardPreview';

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
  approvedDesign,
  approvalRequest,
  explorationComplete,
  onStartDesignApproval,
  onCancelDesignApproval,
  onConfirmDesignApproval,
  onResumeExploration,
}) {
  const feedRef = useRef(null);
  const [exploreDialogOpen, setExploreDialogOpen] = useState(false);
  const [nextStepDefault, setNextStepDefault] = useState(null);
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
  const approvalRound = recommendationMessages.find((item) => item.id === approvalRequest?.messageId);
  const approvalConcept = approvalRound?.concepts.find((item) => item.id === approvalRequest?.conceptId);
  const approvalReference = approvalConcept
    ? { concept: approvalConcept, round: approvalRound.round || 1 }
    : null;



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
            className={`conversation-row ${message.role === 'user' ? 'from-user' : 'from-prototype'} ${message.role === 'recommendations' ? 'recommendation-row' : ''} ${message.role === 'design-approved' ? 'approval-row' : ''}`}
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
                      : message.role === 'design-approved'
                        ? 'Intenta · Design approval'
                      : message.role === 'brief-updated'
                        ? 'Intenta · Active brief updated'
                      : message.role === 'preferences-edited'
                        ? 'Intenta · Preferences updated'
                      : 'Prototype notice'}
              </span>

              {message.role === 'recommendations' ? (
                <ConceptRecommendations
                  recommendation={{ ...message, messageId: message.id }}
                  selectedConceptId={selectedConceptMessageId === message.id ? selectedConceptId : null}
                  approvedConceptId={approvedDesign?.messageId === message.id ? approvedDesign.conceptId : null}
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
              ) : message.role === 'design-approved' ? (
                <div className="approved-design-message" aria-label="Design approval recorded">
                  <div className="approved-design-message-header">
                    <span className="approved-design-icon" aria-hidden="true">✓</span>
                    <div>
                      <h3>{approvedDesign?.approvalMessageId === message.id ? 'Design approved!' : 'Previous design approval'}</h3>
                      <p>
                        {message.approvedDesign?.concept?.name} · Round {message.approvedDesign?.round}
                      </p>
                    </div>
                  </div>
                  {message.approvedDesign?.concept && (
                    <div className="approved-design-message-preview">
                      <BusinessCardPreview concept={message.approvedDesign.concept} />
                    </div>
                  )}
                  <p>
                    {approvedDesign?.approvalMessageId === message.id
                      ? 'You have chosen this design for this project. Exploration is complete for now.'
                      : 'This was an earlier approval. The current approved design is marked in its recommendation round.'}
                  </p>
                  <p className="approved-design-message-note">
                    You can return to exploration later. Your individual confirmed preferences and feedback drafts are unchanged.
                    This approval is part of the in-memory prototype, not a permanent save or export.
                  </p>
                </div>
              ) : message.role === 'brief-updated' ? (
                <div className="brief-update-history" aria-label="Confirmed design brief updates">
                  <p>Your Active Design Brief has been updated. No recommendations were generated automatically.</p>
                  <ul>
                    {message.changes.map((change) => (
                      <li key={change.dimension}>
                        <strong>{change.label}:</strong> {change.mode === 'avoid' ? 'Avoid' : 'Use'} {change.value}
                      </li>
                    ))}
                  </ul>
                  {message.removedPreferences?.length > 0 && (
                    <p>With your approval, removed conflicting Avoid preferences: {message.removedPreferences.map((p) => p.label).join(', ')}.</p>
                  )}
                  {message.unsupported?.length > 0 && (
                    <p className="brief-update-history-note">Other wording was not applied as design rules.</p>
                  )}
                  <p className="brief-update-history-note">Choose Next Step when you're ready to generate more designs.</p>
                </div>
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
        {explorationComplete ? (
          <section className="new-directions-controls simplified-exploration-controls exploration-complete-controls" aria-label="Exploration complete">
            <div className="new-directions-intro">
              <div>
                <strong>Exploration complete for now</strong>
                <p>
                  {approvedDesign?.concept?.name || 'Your chosen design'} is approved. You can revisit earlier designs whenever you like.
                </p>
              </div>
              <button type="button" className="new-directions-button" onClick={onResumeExploration}>
                Return to Exploration
              </button>
            </div>
          </section>
        ) : (
          <>
            {recommendationMessages.length > 0 && (
              <section className="new-directions-controls simplified-exploration-controls" aria-label="Choose next step">
                <div className="new-directions-intro">
                  <div>
                    <strong>Ready to continue?</strong>
                    <p>Explore new directions, try variations, or approve a design.</p>
                  </div>
                  <button type="button" className="new-directions-button" onClick={() => { setNextStepDefault(null); setExploreDialogOpen(true); }}>
                    Choose Next Step
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
              Concepts are simulated CSS designs. Confirmed updates to the Active Design Brief and saved preferences guide later rounds.
            </p>
          </>
        )}
      </div>
      {exploreDialogOpen && !variationRequest && !approvalRequest && !explorationComplete && (
        <ContinueExploringDialog
          selectedConcept={selectedConcept}
          selectedRound={selectedRound}
          initialMode={nextStepDefault}
          pendingCount={pendingCount}
          pendingRoundCount={draftRounds.length}
          onExploreNewDirections={onExploreNewDirections}
          onStartVariations={onStartVariations}
          onStartDesignApproval={onStartDesignApproval}
          onReviewFeedback={reviewUnfinishedFeedback}
          onClose={() => setExploreDialogOpen(false)}
        />
      )}
      {approvalRequest && !explorationComplete && (
        <ConfirmDesignDialog
          reference={approvalReference}
          onConfirm={onConfirmDesignApproval}
          onBack={() => {
            onCancelDesignApproval();
            setNextStepDefault('approve');
            setExploreDialogOpen(true);
          }}
          onClose={onCancelDesignApproval}
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
