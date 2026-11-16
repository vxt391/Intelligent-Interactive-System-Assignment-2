import BusinessCardPreview from './BusinessCardPreview';

const OBJECT_LABELS = {
  background: 'Background', logo: 'Logo / brand', name: 'Name',
  job: 'Job title', contact: 'Contact information', decorations: 'Decorations',
};

export default function RefinementWorkspace({ project, onBack, onChange, onEdit, onUndo }) {
  const draft = project.refinement;
  const update = (patch) => onChange({ ...draft, ...patch });

  if (!draft) {
    return <section className="phase4-empty" aria-label="No design selected">
      <div className="phase4-empty-icon" aria-hidden="true">◈</div>
      <h2>Choose a design to refine</h2>
      <p>Select a business-card concept in Explore, or approve one with Use This Design, then open Refine.</p>
      <button type="button" className="phase4-primary" onClick={onBack}>Back to Explore</button>
    </section>;
  }

  const { working, selectedIds = [], referencesOpen = false, conversationOpen = true } = draft;
  const selectedObjects = selectedIds.filter((id) => Boolean(working.objects[id]));
  const first = selectedObjects.length === 1 ? working.objects[selectedObjects[0]] : null;
  const toggle = (id) => update({ selectedIds: selectedIds.includes(id)
    ? selectedIds.filter((value) => value !== id)
    : [...selectedIds, id] });

  return <div className={`phase4-editor ${referencesOpen ? 'has-references' : ''}`}>
    <aside className={`phase4-references ${referencesOpen ? 'is-open' : ''}`} aria-label="Design references">
      {referencesOpen ? <>
        <div className="phase4-panel-header">
          <h2>References</h2>
          <button type="button" className="phase4-icon-button" onClick={() => update({ referencesOpen: false })} aria-label="Collapse references" title="Collapse references">◀</button>
        </div>
        <div className="phase4-reference-scroll">
          <p className="phase4-mini-label">Starting concept</p>
          <div className="phase4-source-preview"><BusinessCardPreview concept={draft.original} /></div>
          <strong className="phase4-reference-title">{draft.original.name}</strong>
          <p className="phase4-mini-label">Linked Community inspiration</p>
          {(project.inspirationReferences || []).length ? (
            <div className="phase4-reference-cards">
              {project.inspirationReferences.map((ref) => <div key={ref.artworkId} className="phase4-reference-item">
                {ref.image && <img src={ref.image} alt={`Reference artwork ${ref.artworkTitle}`} />}
                <div><strong>{ref.artworkTitle}</strong><span>{ref.referenceOnly ? 'Visual reference only' : 'Approved inspiration reference'}</span></div>
              </div>)}
            </div>
          ) : <p className="phase4-muted">No Community artwork connected to this project.</p>}
          <p className="phase4-muted">References are for comparison; editing the card does not change the original concept or project preferences.</p>
        </div>
      </> : <button type="button" className="phase4-reference-opener" onClick={() => update({ referencesOpen: true })} title="Show references" aria-label="Show references"><span aria-hidden="true">▤</span><span>Refs</span></button>}
    </aside>

    <section className="phase4-canvas-panel" aria-label="Editable design canvas">
      <div className="phase4-panel-header phase4-canvas-heading">
        <div><h2>Design Canvas</h2><p>{draft.original.name} · Working copy</p></div>
        <button type="button" className="phase4-outline-button" onClick={onUndo} disabled={!draft.history?.length} title="Undo last property change">↶ Undo</button>
      </div>
      <div className="phase4-canvas-board">
        <div className={`phase4-business-card ${selectedIds.includes('background') ? 'phase4-background-selected' : ''}`}
          style={{ backgroundColor: working.background, fontFamily: working.typography === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif' }}
          onClick={() => toggle('background')}
          role="button" tabIndex={0} aria-label="Select card background" aria-pressed={selectedIds.includes('background')}
          onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggle('background'); } }}
        >
          {Object.entries(working.objects).map(([id, object]) => <button key={id} type="button"
            className={`phase4-card-object phase4-card-object-${id} ${selectedIds.includes(id) ? 'is-selected' : ''}`}
            style={{ left: `${object.x}%`, top: `${object.y}%`, color: object.color, fontSize: `${object.size}px` }}
            aria-label={`Select ${OBJECT_LABELS[id]}`} aria-pressed={selectedIds.includes(id)}
            onClick={(event) => { event.stopPropagation(); toggle(id); }}>
              {object.text}
            </button>)}
        </div>
        <p className="phase4-canvas-caption">Click directly on card elements to select them. Pointer placement and dragging arrive in Phase 4.2.</p>
      </div>
      <div className="phase4-object-properties">
        <div className="phase4-properties-heading"><h3>Quick properties</h3><span>{selectedIds.length ? `${selectedIds.length} selected` : 'Choose an element on the card'}</span></div>
        {selectedIds.length > 0 ? <>
          <div className="phase4-selected-targets">
            {selectedIds.map((id) => <button key={id} type="button" className="phase4-target-chip" onClick={() => toggle(id)} aria-label={`Remove ${OBJECT_LABELS[id]} selection`}>{OBJECT_LABELS[id]} <span aria-hidden="true">×</span></button>)}
          </div>
          <div className="phase4-property-controls">
            {selectedIds.includes('background') && <label>Background colour <input type="color" value={working.background} onChange={(e) => onEdit({ key: 'background', value: e.target.value })} /></label>}
            {selectedObjects.length > 0 && <>
              <label>Element colour <input type="color" value={first?.color || working.objects[selectedObjects[0]]?.color || '#000000'} onChange={(e) => onEdit({ key: 'color', value: e.target.value })}/></label>
              <label>Size <input type="range" min="8" max="70" value={first?.size || working.objects[selectedObjects[0]]?.size || 20} onChange={(e) => onEdit({ key: 'size', value: Number(e.target.value) })}/></label>
              {first && <label className="phase4-text-property">Text <input type="text" value={first.text} onChange={(e) => onEdit({ key: 'text', value: e.target.value })} /></label>}
            </>}
          </div>
        </> : <p className="phase4-muted">Select a text element or the background to change its properties. These edits affect only this project's working copy.</p>}
      </div>
    </section>

    <aside className={`phase4-conversation ${conversationOpen ? 'is-open' : 'is-collapsed'}`} aria-label="AI refinement conversation">
      {conversationOpen ? <>
        <div className="phase4-panel-header">
          <h2>AI Refinement Conversation</h2>
          <button
            type="button"
            className="phase4-icon-button"
            onClick={() => update({ conversationOpen: false })}
            aria-label="Collapse AI conversation"
            title="Collapse AI conversation"
          >→</button>
        </div>
        <div className="phase4-conversation-history">
          <div className="phase4-assistant-message"><strong>Intenta</strong><p>Your design is ready for refinement. You can select elements on the canvas and adjust their basic properties now.</p><p>Point-and-describe instructions and proposed conversational edits will be added in the next milestones.</p></div>
          {selectedIds.length > 0 && <div className="phase4-selection-message">Selected: {selectedIds.map((id) => OBJECT_LABELS[id]).join(', ')}</div>}
        </div>
        <div className="phase4-conversation-composer">
          <label htmlFor="phase4-prompt">Refinement prompt</label>
          <textarea id="phase4-prompt" placeholder="Object-linked AI instructions arrive in Phase 4.2…" disabled rows={3}/>
          <p>The conversation composer is not active yet. Manual property editing is available on the canvas.</p>
        </div>
      </> : (
        <button
          type="button"
          className="phase4-conversation-opener"
          onClick={() => update({ conversationOpen: true })}
          aria-label="Expand AI conversation"
          title="Expand AI conversation"
        >
          <span aria-hidden="true" className="phase4-conversation-opener-icon">✦</span>
          <span className="phase4-conversation-opener-label">AI Chat</span>
        </button>
      )}
    </aside>
  </div>;
}
