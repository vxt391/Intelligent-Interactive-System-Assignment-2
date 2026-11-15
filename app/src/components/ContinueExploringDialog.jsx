import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** One decision at a time: choose a direction, then use the existing round workflows. */
export default function ContinueExploringDialog({
  selectedConcept,
  selectedRound,
  pendingCount,
  pendingRoundCount,
  onExploreNewDirections,
  onStartVariations,
  onReviewFeedback,
  onClose,
}) {
  const [mode, setMode] = useState(selectedConcept ? 'variations' : 'directions');
  const [stage, setStage] = useState('choose');
  const dialogRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [stage]);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
    ) || [])].filter((element) => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === headingRef.current)) {
      event.preventDefault();
      first.focus();
    }
  }

  function continueChoice() {
    if (mode === 'variations') {
      if (!selectedConcept) return;
      onClose();
      onStartVariations();
      return;
    }
    if (pendingCount > 0) {
      setStage('feedback');
      return;
    }
    onClose();
    onExploreNewDirections();
  }

  return createPortal(
    <div className="variation-backdrop continue-exploring-backdrop">
      <div
        className="variation-dialog continue-exploring-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="continue-dialog-title"
        aria-describedby="continue-dialog-description"
        onKeyDown={handleKeyDown}
      >
        <header className="variation-dialog-header">
          <div>
            <span className="eyebrow">INTENTA · YOUR NEXT STEP</span>
            <h2 id="continue-dialog-title" tabIndex={-1} ref={headingRef}>
              {stage === 'feedback' ? 'You have unfinished feedback' : 'How would you like to continue?'}
            </h2>
          </div>
          <button type="button" className="variation-close" aria-label="Close exploration choices" onClick={onClose}>×</button>
        </header>

        <div className="variation-dialog-body">
          {stage === 'choose' ? (
            <>
              <p id="continue-dialog-description" className="variation-dialog-description">
                Choose one path. Design feedback is optional, and you can change direction later.
              </p>
              <fieldset className="continue-exploring-choices">
                <legend className="visually-hidden">Choose an exploration path</legend>
                <label className={`continue-exploring-choice ${mode === 'variations' ? 'is-selected' : ''} ${!selectedConcept ? 'is-unavailable' : ''}`}>
                  <input
                    type="radio"
                    name="exploration-path"
                    checked={mode === 'variations'}
                    disabled={!selectedConcept}
                    onChange={() => setMode('variations')}
                  />
                  <span className="continue-choice-copy">
                    <strong>Explore variations of this design</strong>
                    <span>Keep the overall direction and experiment with selected attributes.</span>
                    {selectedConcept ? (
                      <small>Selected reference: Round {selectedRound?.round || 1} · {selectedConcept.name}</small>
                    ) : (
                      <small>Select a concept from any round to unlock variations.</small>
                    )}
                  </span>
                </label>
                <label className={`continue-exploring-choice ${mode === 'directions' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="exploration-path"
                    checked={mode === 'directions'}
                    onChange={() => setMode('directions')}
                  />
                  <span className="continue-choice-copy">
                    <strong>Explore new directions</strong>
                    <span>Discover different design ideas using your latest confirmed preferences.</span>
                    <small>No selected concept is required.</small>
                  </span>
                </label>
              </fieldset>
            </>
          ) : (
            <>
              <p id="continue-dialog-description" className="variation-dialog-description">
                You have {pendingCount} unfinished {pendingCount === 1 ? 'attribute' : 'attributes'} across {pendingRoundCount} recommendation {pendingRoundCount === 1 ? 'round' : 'rounds'}.
              </p>
              <p className="variation-scope-note">
                Review and save the feedback now, or continue without applying it. Your draft will remain available in its original round.
              </p>
            </>
          )}
        </div>

        <footer className="variation-dialog-actions">
          <button type="button" className="variation-secondary" onClick={stage === 'feedback' ? () => setStage('choose') : onClose}>
            {stage === 'feedback' ? 'Back' : 'Cancel'}
          </button>
          {stage === 'choose' ? (
            <button type="button" className="variation-primary" onClick={continueChoice}>Continue</button>
          ) : (
            <>
              <button type="button" className="variation-secondary" onClick={() => { onClose(); onReviewFeedback(); }}>
                Review Feedback
              </button>
              <button type="button" className="variation-primary" onClick={() => { onClose(); onExploreNewDirections(); }}>
                Continue Without Applying
              </button>
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
