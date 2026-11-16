import { useEffect, useMemo, useRef } from 'react';
import { COMMUNITY_CATEGORIES, COMMUNITY_PROJECTS, COMMUNITY_STYLES } from '../data/communityProjects';
import { getInspirationAttributes } from '../data/inspirationAttributes';
import ProjectSelectionDialog from './ProjectSelectionDialog';
import InspirationTransferReview from './InspirationTransferReview';

/**
 * Phase 3.2: project-independent creative browsing, detail pages and saved inspiration.
 * All state lives in App so switching to the Design Workspace does not discard it.
 * No confirmed project preferences or design briefs are read or changed here.
 */
export const createCommunityState = () => ({
  view: 'gallery', // gallery | detail | saved
  returnView: 'gallery',
  selectedProjectId: null,
  category: 'Discover',
  query: '',
  style: 'All styles',
  sort: 'featured',
  showFilters: false,
  drafts: {}, // Unsaved attribute selections scoped by artwork ID.
  saved: {}, // Explicitly confirmed inspiration, independent of projects.
  reviewOpen: false,
  removalId: null,
  // Session-only transfer draft. No design project is edited until final confirmation.
  transferRequest: null, // { artworkId, targetProjectId, stage, selectedIds, resolutions, referenceOnly }
  connectionNotice: null, // Explicitly confirmed transfer success; does not redirect.
  scrollPositions: { gallery: 0, saved: 0 },
});

export default function CommunityGallery({
  state, onChange, scrollContainerRef,
  projectChoices = [], onCreateProjectForInspiration,
  onConfirmInspirationTransfer, onViewConnectedProject,
}) {
  const reviewHeadingRef = useRef(null);
  const titleRef = useRef(null);
  const lastOpenedRef = useRef(null);
  const galleryButtonRef = useRef(null);
  const savedButtonRef = useRef(null);

  const {
    view, returnView, selectedProjectId,
    category, query, style, sort, showFilters,
    drafts, saved, reviewOpen, removalId, scrollPositions, transferRequest, connectionNotice,
  } = state;

  const selectedProject = COMMUNITY_PROJECTS.find((item) => item.id === selectedProjectId);
  const projectAttributes = selectedProject ? getInspirationAttributes(selectedProject.id) : [];
  const savedProjectIds = Object.keys(saved).filter((id) => (saved[id]?.length ?? 0) > 0);
  const confirmedIds = selectedProject ? (saved[selectedProject.id] ?? []) : [];
  const draftIds = selectedProject ? (drafts[selectedProject.id] ?? confirmedIds) : [];
  const selectedAttributes = projectAttributes.filter((item) => draftIds.includes(item.id));
  const savedProjects = COMMUNITY_PROJECTS.filter((item) => savedProjectIds.includes(item.id));
  const hasChanges = JSON.stringify([...draftIds].sort()) !== JSON.stringify([...confirmedIds].sort());

  const projects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = COMMUNITY_PROJECTS.filter((item) => {
      const matchesCategory = category === 'Discover' || item.category === category;
      const matchesStyle = style === 'All styles' || item.style === style;
      const text = [item.title, item.category, item.style, ...item.tags, item.description].join(' ').toLowerCase();
      return matchesCategory && matchesStyle && (!needle || text.includes(needle));
    });
    return sort === 'az' ? [...matches].sort((a, b) => a.title.localeCompare(b.title)) : matches;
  }, [category, query, style, sort]);

  const patch = (changes) => onChange((prev) => ({ ...prev, ...changes }));
  const clearFilters = () => patch({ category: 'Discover', query: '', style: 'All styles', sort: 'featured' });

  const saveScroll = (newView, id = null) => {
    lastOpenedRef.current = id;
    const position = scrollContainerRef?.current?.scrollTop ?? 0;
    onChange((prev) => ({
      ...prev,
      view: newView,
      returnView: prev.view === 'detail' ? (prev.returnView ?? 'gallery') : prev.view,
      selectedProjectId: id,
      reviewOpen: false,
      removalId: null,
      scrollPositions: { ...prev.scrollPositions, [prev.view]: position },
    }));
    if (scrollContainerRef?.current) scrollContainerRef.current.scrollTop = 0;
  };

  const openProject = (id) => saveScroll('detail', id);
  const showSaved = () => saveScroll('saved');
  const showGallery = () => saveScroll('gallery');
  const backFromDetail = () => patch({ view: returnView, selectedProjectId: null, reviewOpen: false });

  // Restore search/filter browsing position when returning from a detail page.
  useEffect(() => {
    if ((view === 'gallery' || view === 'saved') && scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = scrollPositions[view] ?? 0;
    }
  }, [view, scrollContainerRef, scrollPositions]);

  useEffect(() => {
    if (reviewOpen) reviewHeadingRef.current?.focus();
    else if (view === 'detail') titleRef.current?.focus();
    else if (view === 'gallery') galleryButtonRef.current?.focus({ preventScroll: true });
    else if (view === 'saved') savedButtonRef.current?.focus({ preventScroll: true });
  }, [reviewOpen, view, selectedProjectId]);

  useEffect(() => {
    if (!reviewOpen && !removalId) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (removalId) patch({ removalId: null });
        else patch({ reviewOpen: false });
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [reviewOpen, removalId]);

  const toggleDraft = (id) => onChange((prev) => {
    const current = prev.drafts[selectedProjectId] ?? prev.saved[selectedProjectId] ?? [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    return { ...prev, drafts: { ...prev.drafts, [selectedProjectId]: next } };
  });

  const confirmInspiration = () => {
    if (!selectedProject || selectedAttributes.length === 0) return;
    onChange((prev) => ({
      ...prev,
      saved: { ...prev.saved, [selectedProjectId]: [...(prev.drafts[selectedProjectId] ?? prev.saved[selectedProjectId] ?? [])] },
      reviewOpen: false,
    }));
  };

  const removeSaved = (id) => onChange((prev) => {
    const nextSaved = { ...prev.saved };
    const nextDrafts = { ...prev.drafts };
    delete nextSaved[id];
    delete nextDrafts[id];
    return {
      ...prev, saved: nextSaved, drafts: nextDrafts, removalId: null,
      transferRequest: prev.transferRequest?.artworkId === id ? null : prev.transferRequest,
    };
  });

  // Only previously confirmed Community inspiration may enter the transfer workflow.
  // Nothing in this component writes to project preferences directly.
  const startConnect = (artworkId) => {
    if (!(saved[artworkId]?.length > 0)) return;
    patch({
      transferRequest: { artworkId, targetProjectId: null, stage: 'select', selectedIds: [], resolutions: {}, referenceOnly: false, error: null },
      connectionNotice: null,
    });
  };
  const selectDestination = (targetProjectId) => onChange((prev) => ({
    ...prev,
    transferRequest: prev.transferRequest
      ? { ...prev.transferRequest, targetProjectId, stage: 'select', resolutions: {}, referenceOnly: false, error: null }
      : null,
  }));
  const continueToReviewBoundary = () => onChange((prev) => {
    const request = prev.transferRequest;
    if (!request || request.stage !== 'select' ||
        !projectChoices.some((project) => project.id === request.targetProjectId) ||
        !(prev.saved[request.artworkId]?.length > 0)) return prev;
    return { ...prev, transferRequest: { ...request, stage: 'review', error: null } };
  });
  const backToProjectSelection = () => onChange((prev) => ({
    ...prev,
    transferRequest: prev.transferRequest
      ? { ...prev.transferRequest, stage: 'select', resolutions: {}, error: null }
      : null,
  }));
  const closeProjectPicker = () => patch({ transferRequest: null });
  const toggleTransferAttribute = (sourceId) => onChange((prev) => {
    const request = prev.transferRequest;
    if (!request || request.stage !== 'review') return prev;
    const selected = request.selectedIds || [];
    const selectedIds = selected.includes(sourceId) ? selected.filter((id) => id !== sourceId) : [...selected, sourceId];
    const resolutions = { ...(request.resolutions || {}) };
    delete resolutions[sourceId];
    return { ...prev, transferRequest: { ...request, selectedIds, resolutions, referenceOnly: false, error: null } };
  });
  const chooseReferenceOnly = (enabled) => onChange((prev) => {
    const request = prev.transferRequest;
    if (!request || request.stage !== 'review' || (request.selectedIds || []).length > 0) return prev;
    return { ...prev, transferRequest: { ...request, referenceOnly: enabled, error: null } };
  });
  const resolveTransferConflict = (sourceId, resolution) => {
    if (!['keep', 'replace', 'skip'].includes(resolution)) return;
    onChange((prev) => {
      const request = prev.transferRequest;
      if (!request || request.stage !== 'review' || !request.selectedIds?.includes(sourceId)) return prev;
      return { ...prev, transferRequest: { ...request, resolutions: { ...request.resolutions, [sourceId]: resolution }, error: null } };
    });
  };
  const transferArtwork = transferRequest
    ? COMMUNITY_PROJECTS.find((project) => project.id === transferRequest.artworkId)
    : null;

  const savedCount = savedProjectIds.length;

  return (
    <section className="phase3-gallery phase3-v32" aria-label="Community Inspiration">
      {/* Explore and Saved Inspiration are sections of the same Community page. */}
      {(view === 'gallery' || view === 'saved') && (
        <>
          <header className="phase3-gallery-heading">
            <div>
              <p className="phase3-eyebrow">EXPLORE THE CREATIVE WORLD</p>
              <h1 id="phase3-title">Community Inspiration</h1>
              <p>Discover ideas across disciplines. Find what speaks to you — no project required.</p>
            </div>
            <span className="phase3-demo-pill" title="All projects are fictional examples">Curated demo gallery</span>
          </header>

          <div className="phase3-collection-switch" role="group" aria-label="Community sections">
            <button
              ref={galleryButtonRef}
              type="button"
              className={`phase3-collection-tab${view === 'gallery' ? ' is-current' : ''}`}
              aria-current={view === 'gallery' ? 'page' : undefined}
              onClick={showGallery}
            >
              Explore
            </button>
            <button
              ref={savedButtonRef}
              type="button"
              className={`phase3-collection-tab${view === 'saved' ? ' is-current' : ''}`}
              aria-current={view === 'saved' ? 'page' : undefined}
              onClick={showSaved}
            >
              Saved Inspiration <span className="phase3-saved-count">{savedCount}</span>
            </button>
          </div>
        </>
      )}

      {connectionNotice && (
        <div className="phase3-connection-success" role="status">
          <div>
            <strong>{connectionNotice.referenceOnly
              ? `✓ Artwork added as a visual reference to ${connectionNotice.projectName}`
              : `✓ Inspiration connected to ${connectionNotice.projectName}`}</strong>
            <p>{connectionNotice.referenceOnly
              ? `“${connectionNotice.artworkTitle}” is linked for visual inspiration only. No design preferences were added or changed, and no new designs were generated.`
              : `“${connectionNotice.artworkTitle}” is linked as a project reference. ${connectionNotice.changesCount} confirmed preference change(s) were applied. No designs were generated.`}</p>
          </div>
          <div className="phase3-connection-actions">
            <button type="button" className="phase3-primary-action" onClick={() => onViewConnectedProject(connectionNotice.projectId)}>View Project</button>
            <button type="button" className="phase3-secondary-action" onClick={() => patch({ connectionNotice: null })}>Dismiss</button>
          </div>
        </div>
      )}

      {view === 'gallery' && (
        <>
          <div className="phase3-search-toolbar">
            <label className="phase3-search" htmlFor="phase3-gallery-search">
              <span className="phase3-search-symbol" aria-hidden="true">⌕</span>
              <input id="phase3-gallery-search" type="search" value={query}
                onChange={(event) => patch({ query: event.target.value })}
                placeholder="Search projects, styles or ideas…" autoComplete="off" />
            </label>
            <button type="button" className={`phase3-filter-toggle${showFilters ? ' is-active' : ''}`}
              aria-expanded={showFilters} aria-controls="phase3-filter-panel"
              onClick={() => patch({ showFilters: !showFilters })}>
              <span aria-hidden="true">☷</span> Filters
              {style !== 'All styles' && <span className="phase3-filter-dot" aria-label="Style filter active" />}
            </button>
            <label className="phase3-sort"><span>Sort</span>
              <select value={sort} onChange={(event) => patch({ sort: event.target.value })} aria-label="Sort community projects">
                <option value="featured">Featured</option><option value="az">Title A–Z</option>
              </select>
            </label>
          </div>
          {showFilters && (
            <div id="phase3-filter-panel" className="phase3-filter-panel">
              <label htmlFor="phase3-style-filter">Design style</label>
              <select id="phase3-style-filter" value={style} onChange={(event) => patch({ style: event.target.value })}>
                {COMMUNITY_STYLES.map((item) => <option key={item}>{item}</option>)}
              </select>
              <button type="button" onClick={clearFilters} className="phase3-clear-link">Clear all filters</button>
            </div>
          )}
          <nav className="phase3-category-nav" aria-label="Creative categories">
            {COMMUNITY_CATEGORIES.map((item) => (
              <button type="button" key={item} className={`phase3-category-chip${category === item ? ' is-selected' : ''}`}
                aria-pressed={category === item} onClick={() => patch({ category: item })}>{item}</button>
            ))}
          </nav>
          <div className="phase3-results-header"><h2>{category === 'Discover' ? 'Explore projects' : category}</h2>
            <span aria-live="polite">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
          </div>
          {projects.length ? (
            <div className="phase3-project-grid">
              {projects.map((project) => (
                <article className="phase3-project-card" key={project.id}>
                  <button type="button" className="phase3-project-open" aria-label={`View ${project.title} project details`}
                    onClick={() => openProject(project.id)}>
                    <span className="phase3-project-image"><img src={project.image} alt={`${project.title}: illustrative visual project artwork`} loading="lazy" /></span>
                    <span className="phase3-project-meta"><strong>{project.title}</strong>
                      <span>{project.category} <span aria-hidden="true">·</span> {project.style}</span>
                      {saved[project.id]?.length > 0 && <span className="phase3-card-saved">✓ Inspiration saved</span>}
                    </span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="phase3-empty" role="status"><span aria-hidden="true">✦</span>
              <h3>No matching projects</h3><p>Try another search or clear the filters to explore more ideas.</p>
              <button type="button" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
          <footer className="phase3-gallery-footer">A curated prototype using original artwork. Your inspiration is kept in this session only and never changes a design project automatically.</footer>
        </>
      )}

      {view === 'saved' && (
        <>
          <div className="phase3-results-header">
            <h2>Saved projects</h2>
            <span aria-live="polite">{savedCount} saved {savedCount === 1 ? 'project' : 'projects'}</span>
          </div>
          {savedProjects.length ? (
            <div className="phase3-saved-grid">
              {savedProjects.map((project) => (
                <article key={project.id} className="phase3-saved-card">
                  <button className="phase3-saved-open" type="button" onClick={() => openProject(project.id)} aria-label={`Revisit ${project.title}`}>
                    <img src={project.image} alt={`${project.title} artwork`} />
                    <span className="phase3-saved-card-title">{project.title}</span>
                    <span className="phase3-saved-card-meta">{project.category} · {saved[project.id].length} selected attributes</span>
                  </button>
                  <div className="phase3-saved-chip-list">
                    {getInspirationAttributes(project.id).filter((a) => saved[project.id].includes(a.id)).map((a) =>
                      <span className="phase3-saved-chip" key={a.id}>{a.label}</span>)}
                  </div>
                  <div className="phase3-saved-actions">
                    <button type="button" className="phase3-connect-button" onClick={() => startConnect(project.id)}>
                      Connect to Project
                    </button>
                    <button type="button" className="phase3-saved-remove" onClick={() => patch({ removalId: project.id })}>Remove saved inspiration</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="phase3-empty phase3-saved-empty" role="status"><span aria-hidden="true">♡</span>
              <h3>No saved inspiration yet</h3><p>Browse the gallery, select attributes and confirm what you'd like to keep.</p>
              <button type="button" onClick={showGallery}>Explore Community</button>
            </div>
          )}
          <footer className="phase3-gallery-footer">Saved inspiration belongs to this session. Connect to Project opens an explicit review; only confirmed, supported preferences are applied to the selected design project.</footer>
        </>
      )}

      {view === 'detail' && selectedProject && (
        <div className="phase3-detail-page">
          <button type="button" className="phase3-back-link" onClick={backFromDetail}>
            ← {returnView === 'saved' ? 'Back to Saved Inspiration' : 'Back to Community'}
          </button>
          <div className="phase3-detail-header">
            <p className="phase3-eyebrow">COMMUNITY PROJECT · {selectedProject.category.toUpperCase()}</p>
            <h1 tabIndex={-1} ref={titleRef}>{selectedProject.title}</h1>
            <p>{selectedProject.description}</p>
            <div className="phase3-detail-meta"><span>{selectedProject.category}</span><span>{selectedProject.style}</span><span>Curated sample artwork</span></div>
          </div>
          <div className="phase3-detail-artwork"><img src={selectedProject.image} alt={`${selectedProject.title}, a fictional ${selectedProject.category.toLowerCase()} project`} /></div>
          <div className="phase3-detail-content">
            <div className="phase3-detail-intro">
              <h2>What inspires you?</h2>
              <p>Choose the design characteristics you find interesting. These are descriptive examples rather than automatically applicable design instructions.</p>
              <p className="phase3-detail-note">Selecting an attribute creates an unsaved draft. Your projects and Current Intentions will not change.</p>
            </div>
            <div className="phase3-attributes-grid">
              {projectAttributes.map((item) => {
                const active = draftIds.includes(item.id);
                return (
                  <button type="button" key={item.id} aria-pressed={active}
                    className={`phase3-attribute-button${active ? ' is-selected' : ''}`}
                    onClick={() => toggleDraft(item.id)}>
                    <span className="phase3-attribute-dimension">{item.dimension}</span>
                    <span className="phase3-attribute-label">{active ? '✓ ' : '+ '}{item.label}</span>
                    <span className="phase3-attribute-description">{item.description}</span>
                  </button>
                );
              })}
            </div>
            <div className="phase3-attribute-summary">
              <div><strong>{draftIds.length} {draftIds.length === 1 ? 'attribute' : 'attributes'} selected</strong>
                <p>{confirmedIds.length > 0 ? `${confirmedIds.length} previously confirmed. ${hasChanges ? 'Your latest selections are not saved yet.' : 'Your selection matches what is saved.'}` : 'Nothing is saved until you confirm your choices.'}</p></div>
              <button type="button" className="phase3-primary-action" disabled={!draftIds.length}
                onClick={() => patch({ reviewOpen: true })}>
                Review Inspiration →
              </button>
            </div>
            {confirmedIds.length > 0 && (
              <div className="phase3-detail-connect">
                <p className="phase3-detail-saved-note">✓ This artwork is saved in Community. Connecting uses its last confirmed attributes, not unsaved changes.</p>
                <button type="button" className="phase3-connect-button" onClick={() => startConnect(selectedProject.id)}>
                  Connect to Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {reviewOpen && selectedProject && (
        <div className="phase3-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) patch({ reviewOpen: false }); }}>
          <section className="phase3-review-dialog" role="dialog" aria-modal="true" aria-labelledby="phase3-review-title">
            <div className="phase3-review-header"><div>
              <p className="phase3-eyebrow">EXPLICIT CONFIRMATION</p>
              <h2 id="phase3-review-title" ref={reviewHeadingRef} tabIndex={-1}>Review Inspiration</h2>
              <p>From: {selectedProject.title}</p>
            </div><button type="button" className="phase3-review-close" onClick={() => patch({ reviewOpen: false })} aria-label="Close review">×</button></div>
            <p className="phase3-review-caption">Remove anything you don't want to keep, then confirm your selection.</p>
            <div className="phase3-review-list">
              {selectedAttributes.map((item) => (
                <div key={item.id} className="phase3-review-row"><div><span>{item.dimension}</span><strong>{item.label}</strong></div>
                  <button type="button" aria-label={`Remove ${item.label} from draft`} onClick={() => toggleDraft(item.id)}>Remove</button>
                </div>
              ))}
              {!selectedAttributes.length && <p className="phase3-review-no-selection">All attributes removed. Close the review to choose again.</p>}
            </div>
            <p className="phase3-review-disclaimer">Confirming saves these attributes to your Community collection only. No project, preference or active brief is modified.</p>
            <div className="phase3-review-actions">
              <button type="button" className="phase3-secondary-action" onClick={() => patch({ reviewOpen: false })}>Back to selection</button>
              <button type="button" className="phase3-primary-action" disabled={!selectedAttributes.length} onClick={confirmInspiration}>Confirm Inspiration</button>
            </div>
          </section>
        </div>
      )}

      {transferRequest?.stage === 'select' && transferArtwork && (saved[transferRequest.artworkId]?.length ?? 0) > 0 && (
        <ProjectSelectionDialog
          request={transferRequest}
          artwork={transferArtwork}
          confirmedAttributes={getInspirationAttributes(transferArtwork.id).filter((attribute) =>
            saved[transferArtwork.id].includes(attribute.id))}
          projects={projectChoices}
          onSelectProject={selectDestination}
          onContinue={continueToReviewBoundary}
          onClose={closeProjectPicker}
          onCreateProject={onCreateProjectForInspiration}
        />
      )}
      {transferRequest?.stage === 'review' && transferArtwork &&
        projectChoices.some((project) => project.id === transferRequest.targetProjectId) &&
        (saved[transferRequest.artworkId]?.length ?? 0) > 0 && (
        <InspirationTransferReview
          request={transferRequest}
          artwork={transferArtwork}
          savedAttributes={getInspirationAttributes(transferArtwork.id).filter((attribute) =>
            saved[transferArtwork.id].includes(attribute.id))}
          destination={projectChoices.find((project) => project.id === transferRequest.targetProjectId)}
          onToggleAttribute={toggleTransferAttribute}
          onResolveConflict={resolveTransferConflict}
          onReferenceOnlyChange={chooseReferenceOnly}
          onBack={backToProjectSelection}
          onClose={closeProjectPicker}
          onConfirm={() => onConfirmInspirationTransfer({
            artworkId: transferRequest.artworkId,
            targetProjectId: transferRequest.targetProjectId,
            selectedIds: transferRequest.selectedIds || [],
            resolutions: transferRequest.resolutions || {},
            referenceOnly: transferRequest.referenceOnly === true,
          })}
        />
      )}

      {removalId && (
        <div className="phase3-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) patch({ removalId: null }); }}>
          <section className="phase3-review-dialog" role="dialog" aria-modal="true" aria-labelledby="phase3-remove-title">
            <div className="phase3-review-header"><div><p className="phase3-eyebrow">SAVED INSPIRATION</p>
              <h2 id="phase3-remove-title">Remove saved inspiration?</h2>
              <p>{COMMUNITY_PROJECTS.find((p) => p.id === removalId)?.title}</p>
            </div></div>
            <p className="phase3-review-caption">This removes the confirmed inspiration from your Community collection. It won't affect any project.</p>
            <div className="phase3-review-actions"><button type="button" className="phase3-secondary-action" onClick={() => patch({ removalId: null })}>Cancel</button>
              <button type="button" className="phase3-destructive-action" onClick={() => removeSaved(removalId)}>Remove Inspiration</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
