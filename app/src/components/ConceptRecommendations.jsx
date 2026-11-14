import BusinessCardPreview from './BusinessCardPreview';
import FeedbackDraft from './FeedbackDraft';
import { attributesForConcept } from '../utils/designAttributes';

const TYPOGRAPHY_LABELS = { serif: 'Serif', sans: 'Sans-serif' };
const LAYOUT_LABELS = {
  spacious: 'Spacious',
  structured: 'Structured',
  dynamic: 'Dynamic',
};

export default function ConceptRecommendations({
  recommendation,
  selectedConceptId,
  onSelectConcept,
  feedbackDraft,
  onToggleDraftAttribute,
  onRateDraftAttribute,
  onRemoveDraftAttribute,
  onConfirmDraftPreferences,
}) {
  const selected = recommendation.concepts.find((concept) => concept.id === selectedConceptId);
  const selectedIds = new Set(feedbackDraft.map((item) => item.id));

  return (
    <section className="recommendations" aria-label="Business card design recommendations">
      <p className="recommendations-intro">
        Here are three possible business-card directions. You can select one as a starting point or leave all unselected.
      </p>
      <p className="recommendations-explanation">{recommendation.explanation}</p>

      <div className="concept-grid">
        {recommendation.concepts.map((concept, index) => {
          const isSelected = selectedConceptId === concept.id;
          return (
            <article
              key={concept.id}
              className={`concept-card ${isSelected ? 'is-selected' : ''}`}
            >
              <BusinessCardPreview concept={concept} />
              <div className="concept-card-content">
                <h3>{String.fromCharCode(65 + index)}. {concept.name}</h3>
                <p className="concept-rationale">{concept.rationale}</p>
                <dl className="concept-details">
                  <div><dt>Colour</dt><dd>{concept.palette}</dd></div>
                  <div><dt>Type</dt><dd>{TYPOGRAPHY_LABELS[concept.typography]}</dd></div>
                  <div><dt>Layout</dt><dd>{LAYOUT_LABELS[concept.layout]}</dd></div>
                  <div><dt>Style</dt><dd>{concept.style}</dd></div>
                </dl>
                <button
                  type="button"
                  className={`concept-select ${isSelected ? 'concept-select-active' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectConcept(concept.id, recommendation.messageId)}
                >
                  {isSelected ? '✓ Selected · click to clear' : 'Select concept'}
                </button>
                <div className="concept-attribute-picker">
                  <p>Select attributes to review:</p>
                  <div className="concept-attribute-chips">
                    {attributesForConcept(concept).map((attribute) => (
                      <button
                        type="button"
                        key={attribute.id}
                        className={`concept-attribute-chip ${selectedIds.has(attribute.id) ? 'is-chosen' : ''}`}
                        aria-pressed={selectedIds.has(attribute.id)}
                        aria-label={`${selectedIds.has(attribute.id) ? 'Remove' : 'Add'} ${attribute.label} ${selectedIds.has(attribute.id) ? 'from' : 'to'} feedback draft`}
                        onClick={() => onToggleDraftAttribute(recommendation.messageId, concept.id, attribute)}
                      >
                        <span aria-hidden="true">{selectedIds.has(attribute.id) ? '✓' : '+'}</span>
                        {attribute.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="concept-selection-feedback" aria-live="polite">
        {selected ? (
          <p><strong>{selected.name} selected.</strong> This is a reference concept, not a confirmed colour, typography or layout preference. You can change or clear the selection.</p>
        ) : (
          <p>No concept selected. Choosing a concept is optional, and does not confirm its individual attributes.</p>
        )}
      </div>

      <FeedbackDraft
        items={feedbackDraft}
        onRate={onRateDraftAttribute}
        onRemove={onRemoveDraftAttribute}
        onConfirm={() => onConfirmDraftPreferences(recommendation.messageId)}
      />
      <p className="recommendations-disclosure">{recommendation.disclosure}</p>
    </section>
  );
}
