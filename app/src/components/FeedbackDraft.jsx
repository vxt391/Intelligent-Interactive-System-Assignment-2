const OPTIONS = [
  { value: 'like', label: 'Like' },
  { value: 'avoid', label: 'Avoid' },
  { value: 'unsure', label: 'Not sure' },
];

export default function FeedbackDraft({ recommendationMessageId, items, onRate, onRemove, onConfirm }) {
  const rated = items.filter((item) => item.sentiment !== null);

  return (
    <section className="feedback-draft" data-feedback-for={recommendationMessageId} aria-label="Shared design attribute feedback">
      <div className="feedback-draft-heading">
        <div>
          <h3>Your feedback draft</h3>
          <p>Only saved ratings will influence later recommendations.</p>
        </div>
        {items.length > 0 && <span className="feedback-draft-count">{rated.length}/{items.length} rated</span>}
      </div>

      {items.length === 0 ? (
        <p className="feedback-draft-empty">Select any attributes above to start. You can also hide this section and continue exploring without feedback.</p>
      ) : (
        <div className="feedback-draft-items">
          {items.map((item) => (
            <div className="feedback-draft-item" key={item.id}>
              <div className="feedback-item-heading">
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.category} · From {item.sourceConceptLabel || item.sourceConceptId?.replace('concept-', '') || 'selected concept'}</span>
                </div>
                <button type="button" className="feedback-remove" aria-label={`Remove ${item.label} from feedback draft`} onClick={() => onRemove(item.id)}>
                  Remove ×
                </button>
              </div>
              <div className="feedback-options" role="group" aria-label={`Feedback for ${item.label}`}>
                {OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`feedback-option ${item.sentiment === option.value ? `feedback-option-${option.value}` : ''}`}
                    aria-pressed={item.sentiment === option.value}
                    onClick={() => onRate(item.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="feedback-draft-footer">
          {rated.length > 0 ? (
            <>
              <div className="feedback-review-summary">
                <strong>Review before saving</strong>
                <ul>
                  {rated.map((item) => (
                    <li key={item.id}>
                      <span className={`preference-sentiment preference-sentiment-${item.sentiment}`}>
                        {item.sentiment === 'like' ? 'Like' : item.sentiment === 'avoid' ? 'Avoid' : 'Not sure'}
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
                <p>Only the rated attributes will be saved. Any unrated selections remain in your draft.</p>
              </div>
              <button type="button" className="feedback-confirm-button" onClick={onConfirm}>
                Save {rated.length} {rated.length === 1 ? 'preference' : 'preferences'}
              </button>
            </>
          ) : (
            <p className="feedback-draft-empty">Choose Like, Avoid or Not sure for an attribute when you're ready. No preferences have been applied.</p>
          )}
        </div>
      )}
    </section>
  );
}
