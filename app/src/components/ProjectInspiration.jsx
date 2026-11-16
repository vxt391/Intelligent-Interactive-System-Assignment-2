/**
 * Phase 3.3.3 — project-scoped inspiration references, kept visually separate
 * from confirmed preferences. This renders a snapshot from project state: it
 * must not depend on whether the artwork is still saved in Community.
 */
const SENTIMENTS = { like: 'Like', avoid: 'Avoid', unsure: 'Not sure' };

function CurrentStatus({ transfer, preferences }) {
  const current = preferences.find((item) => item.id === transfer.targetId);
  if (current?.sentiment === 'like') return null;
  const label = current ? `Now ${SENTIMENTS[current.sentiment] || current.sentiment}` : 'No longer confirmed';
  return <span className="project-inspiration-status">{label}</span>;
}

export default function ProjectInspiration({ references = [], preferences = [], expanded = false, onToggle }) {
  if (!references.length) return null;

  return (
    <section className="intention-section project-inspiration" aria-label="Project inspiration">
      <button
        type="button"
        className="project-inspiration-toggle"
        aria-expanded={expanded}
        aria-controls="project-inspiration-content"
        onClick={onToggle}
      >
        <span className="project-inspiration-toggle-title">
          <span className="project-inspiration-chevron" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
          Project Inspiration
        </span>
        <span className="project-inspiration-count">
          {references.length} {references.length === 1 ? 'reference' : 'references'}
        </span>
      </button>

      <div id="project-inspiration-content" className="project-inspiration-content" hidden={!expanded}>
          <p className="project-inspiration-intro">
            Linked artworks are visual references, separate from the confirmed preferences above.
          </p>
          <ul className="project-inspiration-list">
            {references.map((reference) => {
              const transferred = reference.transferred || [];
              const kept = reference.retainedExisting || [];
              const sourceAttributes = reference.sourceAttributes || [];
              return (
                <li key={reference.artworkId} className="project-inspiration-card">
                  <div className="project-inspiration-card-main">
                    {reference.image ? (
                      <img
                        src={reference.image}
                        alt={`Artwork preview: ${reference.artworkTitle}`}
                        className="project-inspiration-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div className="project-inspiration-thumb project-inspiration-thumb-fallback" aria-hidden="true">◈</div>
                    )}
                    <div className="project-inspiration-card-info">
                      <strong className="project-inspiration-title">{reference.artworkTitle}</strong>
                      <span className="project-inspiration-category">{reference.artworkCategory || 'Community artwork'} · Linked reference</span>
                    </div>
                  </div>

                  {transferred.length > 0 ? (
                    <div className="project-inspiration-transfer">
                      <span className="project-inspiration-caption">Approved at connection</span>
                      <ul className="project-inspiration-tags">
                        {transferred.map((transfer) => (
                          <li key={`${transfer.sourceId}:${transfer.targetId}`} className="project-inspiration-tag">
                            <span>{transfer.targetLabel}</span>
                            <CurrentStatus transfer={transfer} preferences={preferences} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="project-inspiration-none">
                      {reference.referenceOnly === true
                        ? 'Visual reference only — no preferences transferred.'
                        : 'No preferences transferred in this connection.'}
                    </p>
                  )}
                  {kept.length > 0 && (
                    <p className="project-inspiration-retained">
                      {kept.length} conflicting {kept.length === 1 ? 'attribute' : 'attributes'} kept as existing preferences.
                    </p>
                  )}
                  {transferred.length === 0 && sourceAttributes.length > 0 && (
                    <p className="project-inspiration-source">
                      Saved artwork characteristics (not transferred): {sourceAttributes.map((attribute) => attribute.label).join(', ')}.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="project-inspiration-disclaimer">
            Approved-at-connection labels are a historical record. Only your current confirmed
            preferences influence future recommendations; linking an artwork never generates designs automatically.
          </p>
      </div>
    </section>
  );
}
