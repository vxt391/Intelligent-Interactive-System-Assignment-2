import { useEffect, useMemo, useRef, useState } from 'react';
import BusinessCardPreview from './BusinessCardPreview';
import { resolveRefinementConcept } from '../utils/refinementDraft';
import { buildRefinementSvg } from '../utils/refinementExport';
import { MAX_BACKUP_BYTES } from '../utils/projectPersistence';
import { projectStage } from '../utils/projectGalleryLogic';

function relativeDate(isoDate) {
  if (!isoDate) return 'Not yet edited';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Recently edited';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function ProjectArtwork({ project }) {
  const working = project.refinement?.working;
  if (working?.objects) {
    let svg = '';
    try { svg = buildRefinementSvg(working); } catch { /* show a fallback */ }
    if (svg) return (
      <img className="phase5-project-art-image" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
        alt={`Current editable business-card design for ${project.name}`} />
    );
  }
  const selected = resolveRefinementConcept(project)?.concept;
  if (selected) return <div className="phase5-project-art-concept"><BusinessCardPreview concept={selected}/></div>;
  return <div className="phase5-project-placeholder" aria-label="Project has no selected design yet">
    <span aria-hidden="true">✦</span>
    <strong>{project.name}</strong>
    <small>{project.intentions?.initialBrief?.slice(0, 105) || 'Your creative project starts here'}</small>
  </div>;
}

export default function ProjectsGallery({ projects, onResume, onNew, onImport, onBackup, onDelete, saveStatus, saveMessage }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All projects');
  const [sort, setSort] = useState('recent');
  const [importError, setImportError] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const fileRef = useRef(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const deleteDialogRef = useRef(null);
  const cancelDeleteRef = useRef(null);
  const deleteTriggerRef = useRef(null);
  const deleteCandidate = projects.find((project) => project.id === deleteCandidateId);

  // Native modal dialog supplies focus trapping and Escape handling.
  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (deleteCandidateId === null || !dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    cancelDeleteRef.current?.focus();
    return () => { if (dialog.open) dialog.close(); };
  }, [deleteCandidateId]);

  // Restore focus to the visible menu trigger after cancelling. If the card
  // was deleted, move focus to Search rather than leaving it on removed content.
  useEffect(() => {
    if (deleteCandidateId !== null || !deleteTriggerRef.current) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const trigger = deleteTriggerRef.current;
      if (trigger?.isConnected) {
        trigger.focus();
      } else {
        document.querySelector('.phase5-projects-search input')?.focus();
      }
      deleteTriggerRef.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [deleteCandidateId]);

  function confirmDeleteProject() {
    if (!deleteCandidate) return;
    onDelete(deleteCandidate.id);
    setDeleteCandidateId(null);
  }
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = projects.filter((project) => {
      const stage = projectStage(project);
      if (filter !== 'All projects' && stage !== filter) return false;
      return !term || [project.name, stage, project.intentions?.initialBrief || ''].join(' ').toLowerCase().includes(term);
    });
    return [...list].sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name)
      : new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }, [projects, query, filter, sort]);

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImportError('');
    if (file.size > MAX_BACKUP_BYTES) { setImportError('Project files must be 4 MB or smaller.'); return; }
    setImportBusy(true);
    try { await onImport(await file.text()); }
    catch (error) { setImportError(error.message || 'The project could not be imported.'); }
    finally { setImportBusy(false); }
  }

  return <section className="phase5-projects-gallery" aria-label="Your projects">
    <header className="phase5-projects-hero">
      <div>
        <p className="phase5-projects-eyebrow">YOUR WORKSPACE</p>
        <h1>Your Projects</h1>
        <p>Pick up where you left off. Your projects are editable, even after exporting a design.</p>
      </div>
      <div className="phase5-projects-hero-actions">
        <button type="button" className="phase5-projects-secondary" disabled={importBusy} onClick={() => fileRef.current?.click()}>
          {importBusy ? 'Importing…' : '↑ Import project'}
        </button>
        <input ref={fileRef} type="file" accept=".json,.intenta.json,application/json" aria-label="Choose an Intenta project backup"
          onChange={importFile} className="phase5-project-file-input" />
        <button type="button" className="phase5-projects-primary" onClick={onNew}>＋ New Project</button>
      </div>
    </header>

    <div className="phase5-project-save-state">
      <span className={`phase5-project-status-dot is-${saveStatus}`} aria-hidden="true" />
      <span role="status" aria-live="polite" aria-atomic="true">
        {saveStatus === 'saved' ? 'Saved on this device' : saveStatus === 'saving' ? 'Saving project changes…'
          : saveStatus === 'error' ? (saveMessage || 'Autosave failed: download a project backup.')
            : 'Checking locally saved projects…'}
      </span>
      <span className="phase5-project-storage-note">Browser storage can be cleared. Download a project backup for safekeeping.</span>
    </div>
    {importError && <p className="phase5-project-import-error" role="alert">{importError}</p>}
    <div className="phase5-projects-filters">
      <label className="phase5-projects-search">
        <span aria-hidden="true">⌕</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your projects" aria-label="Search your projects" />
      </label>
      <label className="phase5-projects-select">Status
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {['All projects','New','Exploring','Concept selected','Refining'].map((value)=><option key={value}>{value}</option>)}
        </select>
      </label>
      <label className="phase5-projects-select">Sort
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="recent">Recently edited</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
    </div>
    <div className="phase5-projects-result-title"><h2>All your work</h2><span role="status" aria-live="polite" aria-atomic="true">{visible.length} project{visible.length === 1 ? '' : 's'}</span></div>
    {visible.length ? <div className="phase5-projects-grid">
      {visible.map((project) => <article key={project.id} className="phase5-project-card">
        <button type="button" className="phase5-project-art" onClick={() => onResume(project.id)}
          aria-label={`Continue editing ${project.name}`}><ProjectArtwork project={project}/></button>
        <div className="phase5-project-card-info">
          <div className="phase5-project-card-title"><h3 title={project.name}>{project.name}</h3>
            <span className="phase5-project-card-date">{relativeDate(project.updatedAt)}</span></div>
          <div className="phase5-project-card-meta"><span>{projectStage(project)}</span>
            <span>{project.refinement?.original?.name || resolveRefinementConcept(project)?.concept?.name || 'Business-card project'}</span></div>
          <div className="phase5-project-card-actions">
            <button type="button" className="phase5-project-resume" onClick={() => onResume(project.id)}>Continue Editing ↗</button>
            <button type="button" className="phase5-project-backup" title="Download an editable project backup" aria-label={`Download editable backup of ${project.name}`} onClick={() => onBackup(project)}>↓ Backup</button>
            <details className="phase5-project-more">
              <summary aria-label={`More actions for ${project.name}`} title="Project actions">⋯</summary>
              <div className="phase5-project-more-menu">
                <button type="button" className="phase5-project-delete-option"
                  onClick={(event) => {
                    const details = event.currentTarget.closest('details');
                    deleteTriggerRef.current = details?.querySelector('summary') || event.currentTarget;
                    details?.removeAttribute('open');
                    setDeleteCandidateId(project.id);
                  }}>Delete project</button>
              </div>
            </details>
          </div>
        </div>
      </article>)}
    </div> : <div className="phase5-projects-empty">
      <span aria-hidden="true">▧</span>
      <h3>{projects.length === 0 ? 'Your first project starts here' : 'No projects found'}</h3>
      <p>{projects.length === 0 ? 'Create a project to start designing. Your work will appear in this gallery.' : 'Try another search or status filter.'}</p>
      <button type="button" className="phase5-projects-secondary" onClick={() => { setQuery(''); setFilter('All projects'); }}>Clear filters</button>
    </div>}

    {deleteCandidate && <dialog ref={deleteDialogRef} className="phase5-project-delete-dialog"
      aria-labelledby="phase5-delete-title" aria-describedby="phase5-delete-description" role="alertdialog"
      onCancel={(event) => { event.preventDefault(); setDeleteCandidateId(null); }}
      onClose={() => setDeleteCandidateId(null)}>
      <div className="phase5-delete-content">
        <div className="phase5-delete-icon" aria-hidden="true">!</div>
        <h2 id="phase5-delete-title">Delete this project?</h2>
        <p id="phase5-delete-description">
          <strong>{deleteCandidate.name}</strong> and all its saved design edits and project conversations
          will be removed from this browser. This cannot be undone.
        </p>
        <p className="phase5-delete-backup-note">Want to keep a copy? Download an editable backup before deleting.</p>
        <button type="button" className="phase5-delete-backup" onClick={() => onBackup(deleteCandidate)}>
          ↓ Download project backup
        </button>
        <div className="phase5-delete-dialog-actions">
          <button ref={cancelDeleteRef} type="button" className="phase5-delete-cancel"
            onClick={() => setDeleteCandidateId(null)}>Cancel</button>
          <button type="button" className="phase5-delete-confirm"
            onClick={confirmDeleteProject}>Delete Project</button>
        </div>
      </div>
    </dialog>}
  </section>;
}
