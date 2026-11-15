import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BusinessCardPreview from './BusinessCardPreview';
import { VARIATION_DIMENSIONS } from '../utils/variations';

/** A single modal workflow, not an additional scroll region beside the composer. */
export default function VariationDialog({
  request, reference, pendingCount, pendingRoundCount,
  onToggleDimension, onPrepare, onResolveConflict,
  onReviewFeedback, onContinueWithoutFeedback, onCancel,
}) {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected && typeof previous.focus === 'function') previous.focus();
    };
  }, []);

  // Move focus back to the dialog heading whenever a new decision step opens.
  useEffect(() => {
    headingRef.current?.focus();
  }, [request.stage]);

  function trapFocus(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const options = [...(dialogRef.current?.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    ) || [])].filter((node) => !node.hidden);
    if (!options.length) {
      event.preventDefault();
      headingRef.current?.focus();
      return;
    }
    const first = options[0];
    const last = options[options.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === headingRef.current)) {
      event.preventDefault(); first.focus();
    }
  }

  const stage = request.stage;
  const title = stage === 'conflicts' ? 'Review a preference conflict'
    : stage === 'feedback' ? 'Unfinished feedback'
      : stage === 'error' ? 'Variation request needs attention'
        : 'Explore variations';
  const selected = request.dimensions || [];

  return createPortal(
    <div className="variation-backdrop">
      <div
        className="variation-dialog"
        ref={dialogRef}
        onKeyDown={trapFocus}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variation-dialog-heading"
        aria-describedby="variation-dialog-description"
      >
        <header className="variation-dialog-header">
          <div>
            <span className="eyebrow">INTENTA · EXPLORE VARIATIONS</span>
            <h2 id="variation-dialog-heading" tabIndex={-1} ref={headingRef}>{title}</h2>
          </div>
          <button className="variation-close" type="button" aria-label="Close variation dialog" onClick={onCancel}>×</button>
        </header>
        <div className="variation-dialog-body">
          {reference && (
            <div className="variation-reference">
              <div className="variation-reference-preview"><BusinessCardPreview concept={reference.concept} /></div>
              <div className="variation-reference-info">
                <span className="variation-reference-label">REFERENCE CONCEPT</span>
                <strong>Round {reference.round} · {reference.concept.name}</strong>
                <span>This reference remains unchanged. Variations will be added as a new round.</span>
              </div>
            </div>
          )}

          {stage === 'configure' && (
            <>
              <p id="variation-dialog-description" className="variation-dialog-description">
                Choose what to experiment with, or leave all boxes unselected for general variations.
                Other characteristics will stay as consistent as possible.
              </p>
              <fieldset className="variation-fieldset">
                <legend>Attributes to vary (optional)</legend>
                <div className="variation-options">
                  {VARIATION_DIMENSIONS.map((dimension) => (
                    <label key={dimension.id} className={`variation-option ${selected.includes(dimension.id) ? 'is-selected' : ''}`}>
                      <input type="checkbox" checked={selected.includes(dimension.id)} onChange={() => onToggleDimension(dimension.id)} />
                      <span>{dimension.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="variation-scope-note">
                {selected.length
                  ? `Explore combinations of ${VARIATION_DIMENSIONS.filter((d) => selected.includes(d.id)).map((d) => d.label.toLowerCase()).join(', ')}.`
                  : 'Explore general variations with small differences from the selected design.'}
              </p>
              <p className="variation-limit-note">
                The prototype has a limited set of styles. If fewer than three distinct variations are possible, Intenta will explain why.
              </p>
            </>
          )}

          {stage === 'conflicts' && (
            <>
              <p id="variation-dialog-description" className="variation-dialog-description">
                Your selected reference doesn't match some current saved preferences or recognised requirements.
                How should Intenta handle this <strong>for this round only</strong>?
              </p>
              <ul className="variation-conflict-list">
                {(request.conflicts || []).map((conflict, index) => (
                  <li key={`${conflict.dimension}-${index}`}><strong>{conflict.label}:</strong> {conflict.detail}</li>
                ))}
              </ul>
              <div className="variation-resolution-explanation">
                <strong>Respect Current Preferences:</strong> Adjust conflicting reference attributes as needed, even if you didn't select them to vary.
                <span><strong>Keep Reference for This Round:</strong> Allow the conflicting reference attributes as temporary exceptions. Neither choice edits Current Intentions.</span>
              </div>
              {(request.conflicts || []).some((conflict) => conflict.dimension === 'style') && (
                <p className="variation-limit-note">
                  The overall template style is part of the reference identity. Respecting an Avoid for that entire style may require Explore New Directions instead.
                </p>
              )}
            </>
          )}

          {stage === 'feedback' && (
            <>
              <p id="variation-dialog-description" className="variation-dialog-description">
                You still have {pendingCount} unfinished {pendingCount === 1 ? 'attribute' : 'attributes'} across {pendingRoundCount} recommendation {pendingRoundCount === 1 ? 'round' : 'rounds'}.
                Draft feedback won't influence these variations, and nothing will be deleted.
              </p>
              <p className="variation-scope-note">Review the unfinished feedback first, or continue using only confirmed intentions.</p>
            </>
          )}

          {stage === 'error' && (
            <div className="variation-error" role="alert" id="variation-dialog-description">
              {request.error || 'This combination is not available in the current design catalogue.'}
            </div>
          )}
        </div>
        <footer className="variation-dialog-actions">
          <button type="button" className="variation-secondary" onClick={onCancel}>Cancel</button>
          {stage === 'configure' && (
            <button type="button" className="variation-primary" onClick={onPrepare}>Generate Variations</button>
          )}
          {stage === 'conflicts' && (
            <>
              <button type="button" className="variation-secondary" onClick={() => onResolveConflict('keep-reference')}>Keep Reference for This Round</button>
              <button type="button" className="variation-primary" disabled={(request.conflicts || []).some((item) => item.dimension === 'style')} onClick={() => onResolveConflict('respect')}>Respect Current Preferences</button>
            </>
          )}
          {stage === 'feedback' && (
            <>
              <button type="button" className="variation-secondary" onClick={onReviewFeedback}>Review Feedback</button>
              <button type="button" className="variation-primary" onClick={onContinueWithoutFeedback}>Continue Without Applying</button>
            </>
          )}
          {stage === 'error' && (
            <button type="button" className="variation-primary" onClick={onCancel}>Back to Exploration</button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
