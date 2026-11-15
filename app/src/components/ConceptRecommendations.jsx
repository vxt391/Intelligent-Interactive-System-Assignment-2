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
  feedbackExpanded,
  onToggleFeedback,
  onToggleDraftAttribute,
  onRateDraftAttribute,
  onRemoveDraftAttribute,
  onConfirmDraftPreferences,
}) {
  const selected = recommendation.concepts.find((concept) => concept.id === selectedConceptId);
  const selectedIds = new Set(feedbackDraft.map((item) => item.id));
  const ratedCount = feedbackDraft.filter((item) => item.sentiment !== null).length;
  const feedbackId = `concept-feedback-${recommendation.messageId}`;

  return (
    <section className="recommendations" aria-label={`Business card recommendations, round ${recommendation.round || 1}`}>
      <p className="recommendations-intro">
        {recommendation.source === 'new-directions'
          ? `Round ${recommendation.round}: Three new directions using the latest confirmed preferences. Labels distinguish preference-led concepts from the exploratory option.`
          : recommendation.source === 'variations'
            ? `Round ${recommendation.round}: ${recommendation.concepts.length} ${recommendation.concepts.length === 1 ? 'variation' : 'variations'} of Round ${recommendation.reference?.round} · ${recommendation.reference?.name}.`
            : 'Here are three possible business-card directions. Select one as a starting point, or keep exploring without selecting.'}
      </p>
      <p className="recommendations-explanation">{recommendation.explanation}</p>

      <div className="concept-grid">
        {recommendation.concepts.map((concept, index) => {
          const isSelected = selectedConceptId === concept.id;
          return (
            <article key={concept.id} className={`concept-card ${isSelected ? 'is-selected' : ''}`}>
              <BusinessCardPreview concept={concept} />
              <div className="concept-card-content">
                {concept.direction && <span className={`concept-direction ${concept.direction === 'Exploratory' ? 'concept-direction-exploratory' : ''}`}>{concept.direction}</span>}
                <h3>{String.fromCharCode(65 + index)}. {concept.name}</h3>
                <p className="concept-rationale">{concept.rationale}</p>
                <dl className="concept-details">
                  <div><dt>Colour</dt><dd>{concept.palette}</dd></div>
                  <div><dt>Type</dt><dd>{TYPOGRAPHY_LABELS[concept.typography]}</dd></div>
                  <div><dt>Layout</dt><dd>{LAYOUT_LABELS[concept.layout]}</dd></div>
                  <div><dt>Style</dt><dd>{concept.style}</dd></div>
                  {recommendation.source === 'variations' && (
                    <div><dt>Decor</dt><dd>{concept.decorationId || concept.styleId}</dd></div>
                  )}
                </dl>
                {recommendation.source === 'variations' && (
                  <p className="variation-diff-note">
                    <strong>Changed:</strong> {(concept.changedDimensions || []).join(', ')}.
                    {' '}<strong>Kept:</strong> {(concept.preservedDimensions || []).join(', ') || 'none'}.
                  </p>
                )}
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
          <p><strong>{selected.name} selected.</strong> You can use this as a reference for variations, or change your selection. Selecting a design doesn't confirm its individual attributes.</p>
        ) : (
          <p>Selecting a design is optional. You can explore new directions without selecting one.</p>
        )}
      </div>

      <div className="concept-feedback-disclosure" data-feedback-toggle-for={recommendation.messageId}>
        <div className="concept-feedback-disclosure-copy">
          <strong>Want to fine-tune future ideas?</strong>
          <p>Design feedback is optional and won't affect suggestions until you save it.</p>
          {feedbackDraft.length > 0 && (
            <span className="concept-feedback-draft-status" role="status">
              Draft: {feedbackDraft.length} {feedbackDraft.length === 1 ? 'attribute' : 'attributes'} · {ratedCount} rated · Not applied
            </span>
          )}
        </div>
        <button
          type="button"
          className="concept-feedback-toggle"
          aria-expanded={feedbackExpanded}
          aria-controls={feedbackId}
          onClick={() => onToggleFeedback(recommendation.messageId)}
        >
          {feedbackExpanded ? 'Hide design feedback' : feedbackDraft.length ? 'Review feedback draft' : 'Give design feedback'}
          <span aria-hidden="true">{feedbackExpanded ? '⌃' : '⌄'}</span>
        </button>
      </div>

      {feedbackExpanded && (
        <div className="concept-feedback-expanded" id={feedbackId}>
          <div className="feedback-attribute-heading">
            <strong>Choose details from any concept</strong>
            <p>You can combine attributes from different designs. Then mark each as Like, Avoid, or Not sure below.</p>
          </div>
          <div className="feedback-attribute-sources">
            {recommendation.concepts.map((concept, index) => (
              <section key={concept.id} className="feedback-attribute-source" aria-label={`Attributes from concept ${String.fromCharCode(65 + index)} ${concept.name}`}>
                <h4>Concept {String.fromCharCode(65 + index)} · {concept.name}</h4>
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
              </section>
            ))}
          </div>
          <FeedbackDraft
            recommendationMessageId={recommendation.messageId}
            items={feedbackDraft}
            onRate={onRateDraftAttribute}
            onRemove={onRemoveDraftAttribute}
            onConfirm={() => onConfirmDraftPreferences(recommendation.messageId)}
          />
        </div>
      )}
      <p className="recommendations-disclosure">{recommendation.disclosure}</p>
    </section>
  );
}
