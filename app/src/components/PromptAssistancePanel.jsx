import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function PromptAssistancePanel({
  original,
  suggested,
  onSuggestedChange,
  onUseOriginal,
  onUseSuggested,
  onBack,
}) {
  const titleRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    // A separate modal removes the long review form from the short,
    // scrollable conversation composer. Restore focus on exit.
    const previouslyFocused = document.activeElement;
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    titleRef.current?.focus();

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, []);

  function handleDialogKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onBack();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) {
      event.preventDefault();
      titleRef.current?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === titleRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || active === titleRef.current)) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="prompt-review-backdrop">
      <div
        className="prompt-review-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-review-title"
        aria-describedby="prompt-review-description"
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
      >
        <section className="prompt-review" aria-labelledby="prompt-review-title">
      <div className="prompt-review-heading">
        <div>
          <span className="eyebrow">OPTIONAL PROMPT ASSISTANCE</span>
          <h2 id="prompt-review-title" tabIndex={-1} ref={titleRef}>
            Review your prompt before submitting
          </h2>
        </div>
        <div className="prompt-review-header-actions">
          <span className="prompt-review-badge">Rule-based simulation</span>
          <button
            type="button"
            className="prompt-review-close"
            onClick={onBack}
            aria-label="Close prompt review and return to editing"
            title="Back to editing"
          >
            ×
          </button>
        </div>
      </div>

      <p className="prompt-review-intro" id="prompt-review-description">
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
      </div>
    </div>,
    document.body
  );
}
