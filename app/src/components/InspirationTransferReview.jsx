import { useEffect, useRef } from 'react';
import { findTransferConflict, makeTransferOptions, validateTransfer } from '../utils/inspirationTransfer';

/** Milestone 3.3.2: the project is changed ONLY by the final Confirm action. */
export default function InspirationTransferReview({
  artwork, savedAttributes, destination, request,
  onToggleAttribute, onResolveConflict, onReferenceOnlyChange, onBack, onClose, onConfirm,
}) {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const previousFocus = useRef(null);
  const options = makeTransferOptions(artwork.id, savedAttributes);
  const selectedIds = request.selectedIds || [];
  const resolutions = request.resolutions || {};
  const preferences = destination.intentions?.preferences || [];
  const referenceOnly = request.referenceOnly === true;
  const { unresolved, needsChoice, mixedChoice } = validateTransfer({
    options, selectedIds, resolutions, projectPreferences: preferences, referenceOnly,
  });
  const supported = options.filter((item) => item.supported);
  const descriptive = options.filter((item) => !item.supported);
  const included = supported.filter((item) => selectedIds.includes(item.source.id));
  const toApply = included.filter((item) => !['keep', 'skip'].includes(resolutions[item.source.id]));

  useEffect(() => {
    previousFocus.current = document.activeElement;
    headingRef.current?.focus();
    return () => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true });
    };
  }, []);

  function handleKeys(event) {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); onClose(); return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  return (
    <div className="phase3-overlay phase3-transfer-overlay" role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="phase3-review-dialog phase3-transfer-review"
        role="dialog" aria-modal="true" aria-labelledby="phase3-transfer-title"
        onKeyDown={handleKeys}>
        <div className="phase3-review-header">
          <div>
            <p className="phase3-eyebrow">COMMUNITY → DESIGN WORKSPACE · STEP 2 OF 2</p>
            <h2 id="phase3-transfer-title" tabIndex={-1} ref={headingRef}>Review inspiration transfer</h2>
            <p>To: <strong>{destination.name}</strong> · From: <strong>{artwork.title}</strong></p>
          </div>
          <button type="button" className="phase3-review-close" onClick={onClose} aria-label="Close transfer review">×</button>
        </div>

        <div className="phase3-picker-source">
          <img src={artwork.image} alt={`${artwork.title} artwork thumbnail`} />
          <div>
            <strong>{artwork.title}</strong>
            <span>{savedAttributes.length} Community attributes saved · Original Community collection is unchanged</span>
            <small>Only your explicitly selected supported equivalents can become confirmed Likes.</small>
          </div>
        </div>

        <div className="phase3-transfer-intro">
          <h3>Choose what to transfer</h3>
          <p>These are conservative approximations using the existing business-card catalogue. Unchecked items and unsupported characteristics are kept as descriptive artwork references only.</p>
        </div>

        {supported.length > 0 ? (
          <div className="phase3-transfer-list">
            {supported.map((item) => {
              const selected = selectedIds.includes(item.source.id);
              const conflict = findTransferConflict(item, preferences);
              const existing = preferences.find((p) => p.id === item.target.id);
              return (
                <div className={`phase3-transfer-item${selected ? ' is-selected' : ''}`} key={item.source.id}>
                  <label className="phase3-transfer-item-choice">
                    <input type="checkbox" checked={selected} onChange={() => onToggleAttribute(item.source.id)} />
                    <span>
                      <strong>{item.source.label}</strong>
                      <small>{item.source.dimension} → {item.target.label} ({item.target.category})</small>
                      <small>{item.explanation}.</small>
                    </span>
                  </label>
                  {selected && existing?.sentiment === 'like' && (
                    <p className="phase3-transfer-existing">Already confirmed as Like. Linking it won't duplicate the preference.</p>
                  )}
                  {selected && existing?.sentiment === 'unsure' && (
                    <p className="phase3-transfer-existing">Currently Not Sure. Confirming this selection will change it to Like.</p>
                  )}
                  {selected && conflict && (
                    <fieldset className="phase3-transfer-conflict">
                      <legend>Conflict: Current Intentions says Avoid {conflict.label}</legend>
                      <p>Choose the outcome for this attribute. The saved Avoid remains unchanged unless you explicitly choose Replace.</p>
                      {[
                        ['keep', 'Keep existing Avoid', 'Link the artwork but retain this Avoid; do not transfer this attribute.'],
                        ['replace', 'Replace Avoid with Like', 'Update this exact confirmed preference after final confirmation.'],
                        ['skip', 'Skip this attribute', 'Exclude this attribute from the transfer; other choices still apply.'],
                      ].map(([value, label, description]) => (
                        <label key={value} className="phase3-transfer-resolution">
                          <input type="radio" name={`phase3-conflict-${item.source.id}`}
                            checked={resolutions[item.source.id] === value}
                            onChange={() => onResolveConflict(item.source.id, value)} />
                          <span><strong>{label}</strong><small>{description}</small></span>
                        </label>
                      ))}
                    </fieldset>
                  )}
                </div>
              );
            })}
          </div>
        ) : <p className="phase3-transfer-description">There are no actionable mappings for this artwork. You may still link it as a visual reference.</p>}

        {selectedIds.length === 0 && (
          <div className="phase3-reference-only-option">
            <label className="phase3-reference-only-choice">
              <input type="checkbox" checked={referenceOnly}
                onChange={(event) => onReferenceOnlyChange(event.target.checked)} />
              <span><strong>Connect as visual reference only</strong>
                <small>Keep this artwork linked to the selected project without adding or changing any confirmed preferences.</small>
              </span>
            </label>
          </div>
        )}

        {descriptive.length > 0 && (
          <div className="phase3-transfer-descriptive">
            <h3>Reference only · Not applied as preferences</h3>
            <ul>
              {descriptive.map((item) => (
                <li key={item.source.id}><strong>{item.source.label}</strong> — {item.explanation}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="phase3-transfer-summary" aria-live="polite">
          <strong>Final connection summary</strong>
          {needsChoice ? (
            <p><strong>No connection selected yet.</strong> Choose at least one supported attribute above, or explicitly select “Connect as visual reference only”.</p>
          ) : referenceOnly ? (
            <p>“{artwork.title}” will be connected to “{destination.name}” as a <strong>visual reference only</strong>. No confirmed preferences will be changed.</p>
          ) : (
            <>
              <p>Link “{artwork.title}” to “{destination.name}”. {toApply.length} supported attribute {toApply.length === 1 ? 'mapping' : 'mappings'} will be retained as Like preferences (existing Likes remain unchanged). {unresolved.length ? `${unresolved.length} conflict(s) still need a decision.` : 'All selected conflicts are resolved.'}</p>
              {!toApply.length && <p>No new Like preferences will be applied from these selections. Your explicit decisions will be recorded with the artwork reference.</p>}
            </>
          )}
          <p>The original Community saved inspiration, Original Brief, Active Design Brief and existing design rounds will remain unchanged. No new recommendations will be generated.</p>
        </div>
        {request.error && <p className="phase3-transfer-error" role="alert">{request.error}</p>}
        <div className="phase3-review-actions">
          <button type="button" className="phase3-secondary-action" onClick={onBack}>Change project</button>
          <button type="button" className="phase3-secondary-action" onClick={onClose}>Cancel</button>
          <button type="button" className="phase3-primary-action"
            disabled={needsChoice || mixedChoice || unresolved.length > 0}
            onClick={onConfirm}>{referenceOnly ? 'Connect reference only' : 'Confirm connection'}</button>
        </div>
      </section>
    </div>
  );
}
