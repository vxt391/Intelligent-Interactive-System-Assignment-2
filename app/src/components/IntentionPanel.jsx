const GROUPS = [
  { value: 'like', heading: 'Liked attributes', empty: 'No liked attributes yet.' },
  { value: 'avoid', heading: 'Attributes to avoid', empty: 'No attributes to avoid yet.' },
  { value: 'unsure', heading: 'Still exploring', empty: 'No unresolved attributes yet.' },
];

const FEEDBACK_OPTIONS = [
  { value: 'like', label: 'Like' },
  { value: 'avoid', label: 'Avoid' },
  { value: 'unsure', label: 'Not sure' },
];

export default function IntentionPanel({
  intentions,
  preferenceEdit,
  pendingChanges,
  onBeginEdit,
  onChangeEdit,
  onToggleRemoval,
  onSaveChanges,
  onCancelEdit,
  onClose,
}) {
  const editing = preferenceEdit !== null;

  return (
    <aside
      className="intention-panel"
      id="current-intentions-panel"
      aria-label="Current creative intentions"
    >
      <div className="intention-panel-header">
        <div>
          <h2>Current Intentions</h2>
          <p>{editing ? 'Editing · changes not saved' : "What you've explicitly confirmed"}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="intention-close"
          aria-label="Close current intentions panel"
          title={editing ? 'Close panel (keep unsaved edits)' : 'Close panel'}
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

        {editing ? (
          <section className="intention-section intention-edit-section" aria-label="Edit confirmed preferences">
            <div className="intention-edit-heading">
              <h3>Edit confirmed preferences</h3>
              <span className="intention-unsaved-count" role="status">
                {pendingChanges} unsaved {pendingChanges === 1 ? 'change' : 'changes'}
              </span>
            </div>
            <p className="intention-edit-help">
              Adjust one or more statuses or mark an attribute for removal. Nothing changes
              in Current Intentions until you select Save Changes.
            </p>

            <div className="intention-edit-list">
              {preferenceEdit.items.map((item) => (
                <div
                  key={item.id}
                  className={`intention-edit-item ${item.removed ? 'is-marked-for-removal' : ''}`}
                >
                  <div className="intention-edit-item-heading">
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.category}</span>
                    </div>
                    <button
                      type="button"
                      className="intention-remove-button"
                      onClick={() => onToggleRemoval(item.id)}
                      aria-label={`${item.removed ? 'Undo removal of' : 'Remove'} ${item.label}`}
                    >
                      {item.removed ? 'Undo remove' : 'Remove'}
                    </button>
                  </div>
                  {item.removed ? (
                    <p className="intention-removal-note">Marked for removal — not yet saved.</p>
                  ) : (
                    <div className="intention-edit-options" role="group" aria-label={`Preference for ${item.label}`}>
                      {FEEDBACK_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`feedback-option ${item.sentiment === option.value ? `feedback-option-${option.value}` : ''}`}
                          aria-pressed={item.sentiment === option.value}
                          onClick={() => onChangeEdit(item.id, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="intention-edit-actions">
              <button type="button" className="intention-cancel-button" onClick={onCancelEdit}>
                Cancel
              </button>
              <button
                type="button"
                className="intention-save-button"
                disabled={pendingChanges === 0}
                onClick={onSaveChanges}
              >
                Save Changes
              </button>
            </div>
            <p className="intention-edit-help">
              Closing this panel or switching projects keeps your unsaved edits for later.
              Cancel discards them.
            </p>
          </section>
        ) : (
          <section className="intention-section">
            <div className="intention-display-heading">
              <h3>Confirmed preferences ({intentions.preferences.length})</h3>
              {intentions.preferences.length > 0 && (
                <button type="button" className="intention-edit-button" onClick={onBeginEdit}>
                  Edit Preferences
                </button>
              )}
            </div>
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
        )}

        <p className="intention-footnote">
          Only confirmed Like and Avoid feedback will influence future recommendation rounds.
          Not sure remains visible without constraining recommendations.
        </p>
      </div>
    </aside>
  );
}
