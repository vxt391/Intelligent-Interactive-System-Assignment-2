import { useEffect, useRef } from 'react';
import ConceptRecommendations from './ConceptRecommendations';

export default function ConversationView({
  messages,
  composer,
  selectedConceptId,
  onSelectConcept,
  feedbackDraft,
  onToggleDraftAttribute,
  onRateDraftAttribute,
  onRemoveDraftAttribute,
  onConfirmDraftPreferences,
}) {
  const feedRef = useRef(null);

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
          >
            {message.role !== 'user' && (
              <span className="conversation-avatar" aria-hidden="true">✳</span>
            )}
            <div className="conversation-message">
              <span className="conversation-speaker">
                {message.role === 'user'
                  ? 'You'
                  : message.role === 'recommendations'
                    ? 'Intenta · Design concepts'
                    : message.role === 'preferences-confirmed'
                      ? 'Intenta · Preferences confirmed'
                      : 'Prototype notice'}
              </span>

              {message.role === 'recommendations' ? (
                <ConceptRecommendations
                  recommendation={{ ...message, messageId: message.id }}
                  selectedConceptId={selectedConceptId}
                  onSelectConcept={onSelectConcept}
                  feedbackDraft={feedbackDraft.recommendationMessageId === message.id ? feedbackDraft.items : []}
                  onToggleDraftAttribute={onToggleDraftAttribute}
                  onRateDraftAttribute={onRateDraftAttribute}
                  onRemoveDraftAttribute={onRemoveDraftAttribute}
                  onConfirmDraftPreferences={onConfirmDraftPreferences}
                />
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
        <p className="conversation-compose-title">Continue exploring</p>
        {composer}
        <p className="conversation-compose-note">
          Initial concepts are rule-based. Confirmed preferences are now saved in this project; follow-up recommendations arrive in Milestone 5.
        </p>
      </div>
    </section>
  );
}
