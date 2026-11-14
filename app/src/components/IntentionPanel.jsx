export default function IntentionPanel({ intentions, onClose }) {
  return (
    <aside
      className="intention-panel"
      id="current-intentions-panel"
      aria-label="Current creative intentions"
    >
      <div className="intention-panel-header">
        <div>
          <h2>Current Intentions</h2>
          <p>Your confirmed design direction</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="intention-close"
          aria-label="Close current intentions panel"
        >
          ×
        </button>
      </div>

      <div className="intention-panel-body">
        <section className="intention-section">
          <h3>Original design brief</h3>
          {intentions.initialBrief ? (
            <p className="intention-brief">{intentions.initialBrief}</p>
          ) : (
            <p className="intention-empty">Your first submitted prompt will appear here.</p>
          )}
        </section>

        <section className="intention-section">
          <h3>Confirmed preferences ({intentions.preferences.length})</h3>
          {intentions.preferences.length > 0 ? (
            <ul className="intention-preference-list">
              {intentions.preferences.map((preference) => (
                <li key={preference.id}>
                  {preference.label} — {preference.sentiment}
                </li>
              ))}
            </ul>
          ) : (
            <p className="intention-empty">
              No preferences confirmed yet. You'll be able to review and confirm
              individual design attributes in a later Phase 2 milestone.
            </p>
          )}
        </section>

        <p className="intention-footnote">
          This panel will later let you revise preferences. Nothing is inferred
          from your message without confirmation.
        </p>
      </div>
    </aside>
  );
}
