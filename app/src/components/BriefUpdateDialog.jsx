import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { canApplyFollowUpReview, describeBriefValue } from '../utils/followUpBrief';

/** Reviewable, project-scoped natural-language follow-ups; nothing applies on submit alone. */
export default function BriefUpdateDialog({ review, onToggle, onResolve, onApply, onCancel }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    titleRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected && typeof previous.focus === 'function') previous.focus();
    };
  }, []);
  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); onCancel(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled)') || [])];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === titleRef.current)) {
      event.preventDefault(); first.focus();
    }
  }
  return createPortal(
    <div className="variation-backdrop brief-update-backdrop">
      <div className="variation-dialog brief-update-dialog" ref={dialogRef} role="dialog" aria-modal="true"
        aria-labelledby="brief-update-heading" aria-describedby="brief-update-description" onKeyDown={onKeyDown}>
        <header className="variation-dialog-header">
          <div>
            <span className="eyebrow">INTENTA · ACTIVE DESIGN BRIEF</span>
            <h2 id="brief-update-heading" tabIndex={-1} ref={titleRef}>Review proposed changes</h2>
          </div>
          <button type="button" className="variation-close" aria-label="Close brief review" onClick={onCancel}>×</button>
        </header>
        <div className="variation-dialog-body brief-update-body">
          <p id="brief-update-description" className="variation-dialog-description">
            Only the changes you approve will affect future recommendations. No new designs are generated automatically.
          </p>
          <div className="brief-review-original"><span>YOUR FOLLOW-UP</span><p>{review.text}</p></div>
          {review.proposals.length ? (
            <fieldset className="brief-update-fieldset">
              <legend>Choose changes to apply</legend>
              {review.proposals.map((proposal) => (
                <div className="brief-update-item" key={proposal.id}>
                  <label className="brief-update-choice">
                    <input type="checkbox" checked={proposal.enabled} onChange={() => onToggle(proposal.id)}/>
                    <span><strong>{proposal.label}</strong>
                      <small>{proposal.mode === 'require' ? 'Use' : 'Avoid'} {describeBriefValue(proposal.value)}</small>
                    </span>
                  </label>
                  {proposal.enabled && proposal.conflicts.length > 0 && (
                    <div className="brief-update-conflict" role="group" aria-label={`Resolve ${proposal.label} conflict`}>
                      <p><strong>Potential conflict:</strong> Current Intentions marks {proposal.conflicts.map((item) => item.label).join(', ')} as Avoid.</p>
                      <label><input type="radio" name={`brief-resolution-${proposal.id}`}
                        checked={proposal.resolution === 'remove-avoid'} onChange={() => onResolve(proposal.id, 'remove-avoid')}/>
                        Apply this update and remove the conflicting Avoid preference(s)</label>
                      <p className="brief-update-hint">Or uncheck this change to keep your current preferences. Nothing will be removed without your explicit choice.</p>
                    </div>
                  )}
                </div>
              ))}
            </fieldset>
          ) : <p className="brief-update-hint">No supported changes were confidently identified.</p>}
          {review.unsupported.length > 0 && (
            <div className="brief-update-unsupported" role="note">
              <strong>Not interpreted as changes</strong>
              <ul>{review.unsupported.map((note, index) => <li key={index}>{note}</li>)}</ul>
              <p>These words remain in conversation history but won't silently alter design rules.</p>
            </div>
          )}
          <p className="brief-update-hint">Your original wording and unfinished attribute feedback remain unchanged.</p>
        </div>
        <footer className="variation-dialog-actions">
          <button type="button" className="variation-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="variation-primary" disabled={!canApplyFollowUpReview(review)} onClick={onApply}>
            Apply selected changes
          </button>
        </footer>
      </div>
    </div>, document.body
  );
}
