import BusinessCardPreview from './BusinessCardPreview';

const TYPOGRAPHY_LABELS = { serif: 'Serif', sans: 'Sans-serif' };
const LAYOUT_LABELS = {
  spacious: 'Spacious',
  structured: 'Structured',
  dynamic: 'Dynamic',
};

export default function ConceptRecommendations({ recommendation, selectedConceptId, onSelectConcept }) {
  const selected = recommendation.concepts.find((concept) => concept.id === selectedConceptId);

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
      <p className="recommendations-disclosure">{recommendation.disclosure}</p>
    </section>
  );
}
