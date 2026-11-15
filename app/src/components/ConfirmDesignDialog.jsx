import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BusinessCardPreview from './BusinessCardPreview';

/** Explicit, reversible approval step; independent of feedback confirmation. */
export default function ConfirmDesignDialog({ reference, onConfirm, onBack, onClose }) {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll(
      'button:not(:disabled), [tabindex]:not([tabindex="-1"])'
    ) || [])].filter((item) => !item.hidden);
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

  return createPortal(
    <div className="variation-backdrop design-approval-backdrop">
      <div
        className="variation-dialog design-approval-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-approval-title"
        aria-describedby="design-approval-description"
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <header className="variation-dialog-header">
          <div>
            <span className="eyebrow">INTENTA · USE THIS DESIGN</span>
            <h2 id="design-approval-title" tabIndex={-1} ref={headingRef}>Confirm your design</h2>
          </div>
          <button type="button" className="variation-close" aria-label="Close design confirmation" onClick={onClose}>×</button>
        </header>
        <div className="variation-dialog-body design-approval-body">
          {reference ? (
            <>
              <p id="design-approval-description" className="variation-dialog-description">
                Please review your selected concept before finishing exploration.
              </p>
              <div className="design-approval-preview">
                <BusinessCardPreview concept={reference.concept} />
              </div>
              <div className="design-approval-identity">
                <strong>{reference.concept.name}</strong>
                <span>Round {reference.round} · {reference.concept.palette} · {reference.concept.layout} layout</span>
              </div>
              <p className="design-approval-note">
                Confirming this design will record it as the approved concept for this project. You can return to exploration later.
                Its individual attributes will <strong>not</strong> automatically become confirmed preferences.
                Unsaved feedback remains untouched, and this in-memory prototype does not permanently save or export designs.
              </p>
            </>
          ) : (
            <p id="design-approval-description" className="variation-error" role="alert">
              The selected design could not be found. Go back and select a concept again.
            </p>
          )}
        </div>
        <footer className="variation-dialog-actions">
          <button type="button" className="variation-secondary" onClick={onBack}>Back</button>
          <button type="button" className="variation-primary" disabled={!reference} onClick={onConfirm}>
            Confirm Design
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
