import { useEffect, useRef } from 'react';

export default function ConversationView({ messages, composer }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
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
            className={`conversation-row ${message.role === 'user' ? 'from-user' : 'from-prototype'}`}
            key={message.id}
          >
            {message.role !== 'user' && (
              <span className="conversation-avatar" aria-hidden="true">✳</span>
            )}
            <div className="conversation-message">
              <span className="conversation-speaker">
                {message.role === 'user' ? 'You' : 'Prototype notice'}
              </span>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="conversation-composer">
        <p className="conversation-compose-title">Continue exploring</p>
        {composer}
        <p className="conversation-compose-note">
          Messages are kept in this browser session. Simulated AI responses are not active yet.
        </p>
      </div>
    </section>
  );
}
