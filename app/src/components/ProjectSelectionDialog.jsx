import { useEffect, useRef } from 'react';

/**
 * Milestone 3.3.2: destination selection is a required first step. It must not
 * preselect a project or change a preference before final transfer confirmation.
 */
export default function ProjectSelectionDialog({
  request, artwork, confirmedAttributes, projects,
  onSelectProject, onContinue, onClose, onCreateProject,
}) {
  const headingRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const chosenProject = projects.find((item) => item.id === request.targetProjectId);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    return () => {
      if (previouslyFocusedRef.current?.isConnected) {
        previouslyFocusedRef.current.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => { headingRef.current?.focus(); }, [request.stage]);

  function handleKeys(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  return (
    <div className="phase3-overlay phase3-transfer-overlay" role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="phase3-review-dialog phase3-project-picker"
        role="dialog" aria-modal="true" aria-labelledby="phase3-pick-title"
        aria-describedby="phase3-pick-description" onKeyDown={handleKeys}>
        <div className="phase3-review-header">
          <div>
            <p className="phase3-eyebrow">COMMUNITY → DESIGN WORKSPACE · STEP 1 OF 2</p>
            <h2 id="phase3-pick-title" ref={headingRef} tabIndex={-1}>
              Choose a design project
            </h2>
            <p id="phase3-pick-description">
              Select where you want to bring this saved inspiration. No project is selected automatically.
            </p>
          </div>
          <button type="button" className="phase3-review-close" onClick={onClose} aria-label="Close project selection">×</button>
        </div>

        <div className="phase3-picker-source">
          <img src={artwork.image} alt={`${artwork.title} artwork thumbnail`} />
          <div>
            <strong>{artwork.title}</strong>
            <span>{artwork.category} · {confirmedAttributes.length} saved {confirmedAttributes.length === 1 ? 'attribute' : 'attributes'}</span>
            <small>Community original remains unchanged.</small>
          </div>
        </div>

        {projects.length ? (
          <fieldset className="phase3-picker-options">
            <legend>Select destination project</legend>
            {projects.map((project) => (
              <label key={project.id}
                className={`phase3-picker-option${request.targetProjectId === project.id ? ' is-selected' : ''}`}>
                <input type="radio" name="phase3-target-project"
                  checked={request.targetProjectId === project.id}
                  onChange={() => onSelectProject(project.id)} />
                <span><strong>{project.name}</strong><small>Business-card design project</small></span>
              </label>
            ))}
          </fieldset>
        ) : (
          <div className="phase3-picker-empty" role="status">
            <strong>No design projects yet</strong>
            <p>You can keep exploring Community. Create a project when you're ready to connect inspiration.</p>
          </div>
        )}
        <button type="button" className="phase3-picker-create" onClick={onCreateProject}>
          + Create New Project
        </button>
        <p className="phase3-picker-footnote">Creating a project keeps you in Community. You'll still choose it explicitly above.</p>
        <div className="phase3-review-actions">
          <button type="button" className="phase3-secondary-action" onClick={onClose}>Cancel</button>
          <button type="button" className="phase3-primary-action"
            disabled={!chosenProject} onClick={onContinue}>Continue to review →</button>
        </div>
      </section>
    </div>
  );
}
