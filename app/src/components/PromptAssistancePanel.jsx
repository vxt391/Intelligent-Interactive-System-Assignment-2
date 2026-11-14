import { useEffect, useRef } from 'react';

export default function PromptAssistancePanel({
  original,
  suggested,
  onSuggestedChange,
  onUseOriginal,
  onUseSuggested,
  onBack,
}) {
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className="prompt-review" aria-labelledby="prompt-review-title">
      <div className="prompt-review-heading">
        <div>
          <span className="eyebrow">OPTIONAL PROMPT ASSISTANCE</span>
          <h2 id="prompt-review-title" tabIndex={-1} ref={titleRef}>
            Review your prompt before submitting
          </h2>
        </div>
        <span className="prompt-review-badge">Rule-based simulation</span>
      </div>

      <p className="prompt-review-intro">
        Your original wording is preserved. The suggestion adds general design guidance,
        not new preferences. You can edit it or submit the original instead.
      </p>

      <div className="prompt-review-grid">
        <div className="prompt-review-field">
          <h3>Original prompt</h3>
          <div className="prompt-review-original">{original}</div>
        </div>
        <div className="prompt-review-field">
          <label htmlFor="prompt-review-suggestion">Suggested prompt · editable</label>
          <textarea
            id="prompt-review-suggestion"
            className="prompt-review-textarea"
            value={suggested}
            onChange={(event) => onSuggestedChange(event.target.value)}
            rows={6}
          />
        </div>
      </div>

      <div className="prompt-review-actions">
        <button type="button" className="prompt-review-back" onClick={onBack}>
          Back to editing
        </button>
        <div className="prompt-review-submit-options">
          <button type="button" className="prompt-review-original-button" onClick={onUseOriginal}>
            Submit original
          </button>
          <button
            type="button"
            className="prompt-review-suggested-button"
            onClick={onUseSuggested}
            disabled={!suggested.trim()}
          >
            Submit suggestion
          </button>
        </div>
      </div>
    </section>
  );
}
