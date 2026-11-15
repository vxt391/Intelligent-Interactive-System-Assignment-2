import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** One-round resolution; the project brief and confirmed preferences are never mutated here. */
export default function NewDirectionConflictDialog({ conflicts, onResolve, onCancel }) {
  const [choice, setChoice] = useState('');
  const ref = useRef(null);
  const heading = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    heading.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected && typeof previous.focus === 'function') previous.focus();
    };
  }, []);
  function keys(event) {
    if (event.key === 'Escape') { event.preventDefault(); onCancel(); return; }
    if (event.key !== 'Tab') return;
    const items = [...(ref.current?.querySelectorAll('button:not(:disabled), input:not(:disabled)') || [])];
    if (!items.length) return;
    if (event.shiftKey && (document.activeElement === items[0] || document.activeElement === heading.current)) {
      event.preventDefault(); items[items.length - 1].focus();
    } else if (!event.shiftKey && (document.activeElement === items[items.length - 1] || document.activeElement === heading.current)) {
      event.preventDefault(); items[0].focus();
    }
  }
  return createPortal(
    <div className="variation-backdrop">
      <div className="variation-dialog brief-conflict-dialog" ref={ref} role="dialog" aria-modal="true"
        aria-labelledby="direction-conflict-heading" onKeyDown={keys}>
        <header className="variation-dialog-header">
          <div><span className="eyebrow">INTENTA · NEW DIRECTIONS</span>
            <h2 id="direction-conflict-heading" ref={heading} tabIndex={-1}>Review conflicting instructions</h2>
          </div>
          <button type="button" className="variation-close" aria-label="Close conflict dialog" onClick={onCancel}>×</button>
        </header>
        <div className="variation-dialog-body">
          <p className="variation-dialog-description">The active brief and saved Avoid preferences overlap. Choose how to handle them for this round only.</p>
          <ul className="variation-conflict-list">{conflicts.map((conflict) => <li key={conflict.id}>{conflict.detail}</li>)}</ul>
          <fieldset className="brief-conflict-choices">
            <legend>How should Intenta generate this round?</legend>
            <label><input type="radio" name="direction-resolution" checked={choice === 'respect-brief'} onChange={() => setChoice('respect-brief')}/>
              <span><strong>Respect the active design brief</strong><small>Temporarily ignore the overlapping Avoid choice(s) for this round.</small></span>
            </label>
            <label><input type="radio" name="direction-resolution" checked={choice === 'respect-preferences'} onChange={() => setChoice('respect-preferences')}/>
              <span><strong>Prioritise saved Avoid preferences</strong><small>Temporarily relax the overlapping requirements for this round.</small></span>
            </label>
          </fieldset>
          <p className="brief-update-hint">Your Active Design Brief and Current Intentions will not change.</p>
        </div>
        <footer className="variation-dialog-actions">
          <button type="button" className="variation-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="variation-primary" disabled={!choice} onClick={() => onResolve(choice)}>Generate this round</button>
        </footer>
      </div>
    </div>, document.body
  );
}
