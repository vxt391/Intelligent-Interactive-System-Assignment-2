import { useEffect, useRef, useState } from 'react';
import ConceptRecommendations from './ConceptRecommendations';

export default function ConversationView({
  messages,
  composer,
  selectedConceptId,
  selectedConceptMessageId,
  onSelectConcept,
  feedbackDrafts,
  onExploreNewDirections,
  onToggleDraftAttribute,
  onRateDraftAttribute,
  onRemoveDraftAttribute,
  onConfirmDraftPreferences,
}) {
  const feedRef = useRef(null);
  const [confirmNextRound, setConfirmNextRound] = useState(false);
  const recommendationMessages = messages.filter((message) => message.role === 'recommendations');
  const draftRounds = recommendationMessages.filter((message) =>
    (feedbackDrafts[message.id]?.items.length ?? 0) > 0
  );
  const pendingCount = draftRounds.reduce((count, message) =>
    count + feedbackDrafts[message.id].items.length, 0
  );

  function requestNextRound() {
    if (pendingCount > 0) {
      setConfirmNextRound(true);
    } else {
      setConfirmNextRound(false);
      onExploreNewDirections();
    }
  }

  function continueWithoutDraft() {
    setConfirmNextRound(false);
    onExploreNewDirections();
  }

  function reviewUnfinishedFeedback() {
    setConfirmNextRound(false);
    const mostRecent = draftRounds[draftRounds.length - 1];
    const draftSections = feedRef.current?.querySelectorAll('[data-feedback-for]') ?? [];
    const target = [...draftSections].find((element) =>
      Number(element.dataset.feedbackFor) === mostRecent?.id
    );
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  useEffect(() => {
    if (!feedRef.current) return;
    // On the first submission, keep the three concept cards visible from the top.
    // Later messages should scroll into view normally.
    feedRef.current.scrollTop = messages.length <= 2 ? 0 : feedRef.current.scrollHeight;
  }, [messages.length]);

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
                  onToggleDraftAttribute={onToggleDraftAttribute}
                  onRateDraftAttribute={(id, sentiment) => onRateDraftAttribute(message.id, id, sentiment)}
                  onRemoveDraftAttribute={(id) => onRemoveDraftAttribute(message.id, id)}
                  onConfirmDraftPreferences={onConfirmDraftPreferences}
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
          <section className="new-directions-controls" aria-label="Explore more design directions">
            <div className="new-directions-intro">
              <div>
                <strong>Ready to discover more?</strong>
                <p>Get three new designs using your latest confirmed preferences.</p>
              </div>
              <button type="button" className="new-directions-button" onClick={requestNextRound}>
                Explore New Directions
              </button>
            </div>
            {confirmNextRound && pendingCount > 0 && (
              <div className="new-directions-draft-warning" role="group" aria-label="Unfinished feedback review">
                <p>
                  You have {pendingCount} unfinished {pendingCount === 1 ? 'attribute' : 'attributes'} across
                  {' '}{draftRounds.length} recommendation {draftRounds.length === 1 ? 'round' : 'rounds'}.
                  Only previously confirmed preferences will guide the next designs.
                  Your unfinished feedback will be kept.
                </p>
                <div className="new-directions-draft-actions">
                  <button type="button" className="new-directions-review" onClick={reviewUnfinishedFeedback}>
                    Review Feedback
                  </button>
                  <button type="button" className="new-directions-continue" onClick={continueWithoutDraft}>
                    Continue Without Applying
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
        <p className="conversation-compose-title">Continue exploring with a prompt</p>
        {composer}
        <p className="conversation-compose-note">
          Recommendations are simulated CSS designs. The original brief and confirmed preferences guide new directions.
          Explore Variations and Use This Design will be added in later steps.
        </p>
      </div>
    </section>
  );
}
