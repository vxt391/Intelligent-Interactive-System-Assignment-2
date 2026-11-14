const GROUPS = [
  { value: 'like', heading: 'Liked attributes', empty: 'No liked attributes yet.' },
  { value: 'avoid', heading: 'Attributes to avoid', empty: 'No attributes to avoid yet.' },
  { value: 'unsure', heading: 'Still exploring', empty: 'No unresolved attributes yet.' },
];

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
          <p>What you've explicitly confirmed</p>
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
          {intentions.preferences.length === 0 && (
            <p className="intention-empty">
              No confirmed preferences yet. Select and rate attributes on the concepts,
              then confirm them in the shared feedback area.
            </p>
          )}
          {GROUPS.map((group) => {
            const matches = intentions.preferences.filter((item) => item.sentiment === group.value);
            return (
              <div className="intention-group" key={group.value}>
                <h4>{group.heading}</h4>
                {matches.length > 0 ? (
                  <ul className="intention-tags">
                    {matches.map((item) => (
                      <li key={item.id} className={`intention-tag intention-tag-${group.value}`}>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="intention-empty">{group.empty}</p>
                )}
              </div>
            );
          })}
        </section>

        <p className="intention-footnote">
          Only confirmed Like and Avoid feedback will influence future recommendation rounds.
          Not sure keeps an attribute visible without treating it as a constraint.
          Editing or removing confirmed preferences with Save Changes / Cancel arrives in Step 4.3.
        </p>
      </div>
    </aside>
  );
}
