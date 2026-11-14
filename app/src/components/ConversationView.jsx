import { useEffect, useRef } from 'react';
import ConceptRecommendations from './ConceptRecommendations';

export default function ConversationView({ messages, composer, selectedConceptId, onSelectConcept }) {
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
                    : 'Prototype notice'}
              </span>

              {message.role === 'recommendations' ? (
                <ConceptRecommendations
                  recommendation={{ ...message, messageId: message.id }}
                  selectedConceptId={selectedConceptId}
                  onSelectConcept={onSelectConcept}
                />
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
          Initial business-card concepts use a rule-based simulation. Follow-up recommendations and preference feedback arrive in later milestones.
        </p>
      </div>
    </section>
  );
}
