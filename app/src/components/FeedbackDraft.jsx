const OPTIONS = [
  { value: 'like', label: 'Like' },
  { value: 'avoid', label: 'Avoid' },
  { value: 'unsure', label: 'Not sure' },
];

export default function FeedbackDraft({ items, onRate, onRemove }) {
  const ratedCount = items.filter((item) => item.sentiment !== null).length;

  return (
    <section className="feedback-draft" aria-label="Shared design attribute feedback">
      <div className="feedback-draft-heading">
        <div>
          <h3>Your feedback draft</h3>
          <p>Review attributes selected across the three concepts. Nothing is applied yet.</p>
        </div>
        <span className="feedback-draft-count">{ratedCount}/{items.length} rated</span>
      </div>

      {items.length === 0 ? (
        <p className="feedback-draft-empty">
          Select a colour, typography, layout or style chip on any concept to add it here.
        </p>
      ) : (
        <div className="feedback-draft-items">
          {items.map((item) => (
            <div className="feedback-draft-item" key={item.id}>
              <div className="feedback-item-heading">
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.category} · From {item.sourceConceptId.replace('concept-', '')}</span>
                </div>
                <button
                  type="button"
                  className="feedback-remove"
                  aria-label={`Remove ${item.label} from feedback draft`}
                  onClick={() => onRemove(item.id)}
                >
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
      <div className="feedback-draft-footer">
        <span>Draft only · Preferences will be confirmed in Step 4.2.</span>
      </div>
    </section>
  );
}
