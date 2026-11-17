import { useEffect, useRef, useState } from 'react';
import BusinessCardPreview from './BusinessCardPreview';
import { ensureMovableDesignDetails, refinementObjectKind } from '../utils/refinementDraft';
import {
  refinementObjectLabel,
  addRefinementPointer,
  removeRefinementPointer,
  clearRefinementPointers,
} from '../utils/refinementPointers';
import { proposeRefinementRequest, acceptRefinementProposal, rejectRefinementProposal } from '../utils/refinementChanges';
import { exportRefinementSvg, exportRefinementPng } from '../utils/refinementExport';
import { deselectRefinementOnBoard } from '../utils/refinementSelection';
import { normaliseRefinementRotation, rotationPointerAngle, rotationFromPointer } from '../utils/refinementRotation';
import { MIN_REFINEMENT_ZOOM, MAX_REFINEMENT_ZOOM, refinementZoomValue, nextRefinementZoom, refinementZoomShortcut } from '../utils/refinementZoom';

const dragClamp = (value, lower, upper) => Math.min(upper, Math.max(lower, value));

export default function RefinementWorkspace({ project, onBack, onChange, onEdit, onUndo, onRedo }) {
  const draft = project.refinement;
  const cardRef = useRef(null);
  const exportRef = useRef(null);
  const dragRef = useRef(null);
  const rotateRef = useRef(null);
  const ignoreNextClickRef = useRef(false);
  const [dragPreview, setDragPreview] = useState(null);
  const [rotationPreview, setRotationPreview] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState('');
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);

  useEffect(() => { setExportOpen(false); setExportError(''); }, [project.id]);
  useEffect(() => {
    if (!exportOpen) return undefined;
    const dismiss = (event) => {
      if (event.type === 'keydown' && event.key === 'Escape') setExportOpen(false);
      else if (event.type === 'pointerdown' && !exportRef.current?.contains(event.target)) setExportOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', dismiss); };
  }, [exportOpen]);

  // Hot-reload compatibility: previously opened session drafts may have an
  // unmovable icon / divider. Upgrade in place without resetting other edits.
  useEffect(() => {
    if (!draft) return;
    const upgraded = ensureMovableDesignDetails(draft.working);
    if (upgraded !== draft.working) onChange({ ...draft, working: upgraded });
  }, [draft, onChange]);

  // Intercept native browser zoom only while this Refine workspace is mounted
  // and the user is not typing in a text field. The rest of Intenta keeps
  // standard browser Ctrl+Plus / Ctrl+Minus behaviour.
  useEffect(() => {
    if (!draft) return undefined;
    const handleKeyDown = (event) => {
      const direction = refinementZoomShortcut(event);
      if (!direction) return;
      event.preventDefault();
      const zoom = nextRefinementZoom(draft.zoom, direction);
      if (zoom !== refinementZoomValue(draft.zoom)) onChange({ ...draft, zoom });
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [draft, onChange]);

  if (!draft) {
    return <section className="phase4-empty" aria-label="No design selected">
      <div className="phase4-empty-icon" aria-hidden="true">◈</div>
      <h2>Choose a design to refine</h2>
      <p>Select a business-card concept in Explore, or approve one with Use This Design, then open Refine.</p>
      <button type="button" className="phase4-primary" onClick={onBack}>Back to Explore</button>
    </section>;
  }

  const {
    working, selectedIds = [], referencesOpen = false, conversationOpen = true,
    pointers = [], toolMode = 'edit', promptDraft = '', refinementMessages = [],
    pendingProposal = null, previewVisible = false,
  } = draft;
  const previewLocked = Boolean(pendingProposal);
  const cardWorking = previewLocked && previewVisible ? pendingProposal.working : working;
  const pointMode = toolMode === 'point';
  const zoom = refinementZoomValue(draft.zoom);
  const selectedObjects = selectedIds.filter((id) => Boolean(working.objects[id] && working.objects[id].visible !== false));
  const first = selectedObjects.length === 1 ? working.objects[selectedObjects[0]] : null;
  const firstRotation = first ? normaliseRefinementRotation(first.rotation) : 0;
  const objectLabel = (id) => refinementObjectLabel(id, working.objects);
  const objectKind = (id) => refinementObjectKind(id, working.objects[id]);
  const update = (patch) => onChange({ ...draft, ...patch });
  const toggle = (id) => { if (previewLocked) return; update({ selectedIds: selectedIds.includes(id)
    ? selectedIds.filter((value) => value !== id)
    : [...selectedIds, id] }); };

  const putPointer = (event, objectId = 'background') => {
    if (previewLocked) return;
    const card = cardRef.current;
    if (!card) return;
    const rectangle = card.getBoundingClientRect();
    if (!rectangle.width || !rectangle.height) return;
    const object = working.objects[objectId];
    // Keyboard activation does not have a meaningful clientX/clientY: pin its object's centre.
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? (objectKind(objectId) === 'mark' ? object?.x - 2 : objectKind(objectId) === 'divider' ? object?.x + 45 : object ? object.x + 5 : 50)
      : ((event.clientX - rectangle.left) / rectangle.width) * 100;
    const y = fromKeyboard ? (object ? object.y : 50)
      : ((event.clientY - rectangle.top) / rectangle.height) * 100;
    onChange(addRefinementPointer(draft, { x, y, objectId }));
  };

  const beginDrag = (event, id) => {
    if (previewLocked || pointMode || event.button !== 0) return;
    const object = working.objects[id];
    if (!object || object.visible === false) return;
    dragRef.current = {
      id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      originalX: object.x, originalY: object.y, moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveDrag = (event, id) => {
    const moving = dragRef.current;
    if (!moving || moving.id !== id || moving.pointerId !== event.pointerId) return;
    const card = cardRef.current;
    if (!card) return;
    if (Math.hypot(event.clientX - moving.startX, event.clientY - moving.startY) <= 4 && !moving.moved) return;
    moving.moved = true;
    const rectangle = card.getBoundingClientRect();
    if (!rectangle.width || !rectangle.height) return;
    moving.latest = { id,
      x: dragClamp(moving.originalX + (event.clientX - moving.startX) * 100 / rectangle.width, 2, objectKind(id) === 'mark' ? 98 : 92),
      y: dragClamp(moving.originalY + (event.clientY - moving.startY) * 100 / rectangle.height, 8, 92),
    };
    setDragPreview(moving.latest);
  };
  const finishDrag = (event, id) => {
    const moving = dragRef.current;
    if (!moving || moving.id !== id || moving.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (moving.moved && moving.latest) {
      ignoreNextClickRef.current = true;
      // Guard against a browser not synthesising a click after pointer capture.
      window.setTimeout(() => { ignoreNextClickRef.current = false; }, 0);
      onEdit({ key: 'position', id, value: { x: moving.latest.x, y: moving.latest.y } });
    }
    setDragPreview(null);
  };
  const cancelDrag = () => { dragRef.current = null; setDragPreview(null); };

  const beginRotation = (event, id) => {
    if (previewLocked || pointMode || selectedObjects.length !== 1 || event.button !== 0) return;
    const cardRect = cardRef.current?.getBoundingClientRect();
    const object = working.objects[id];
    if (!cardRect || !object || object.visible === false) return;
    event.preventDefault();
    event.stopPropagation();
    const pivotX = cardRect.left + object.x * cardRect.width / 100;
    const pivotY = cardRect.top + object.y * cardRect.height / 100;
    rotateRef.current = {
      id, pointerId: event.pointerId, pivotX, pivotY,
      startAngle: rotationPointerAngle(event.clientX, event.clientY, pivotX, pivotY),
      startRotation: normaliseRefinementRotation(object.rotation),
      latest: normaliseRefinementRotation(object.rotation),
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveRotation = (event) => {
    const active = rotateRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const angle = rotationPointerAngle(event.clientX, event.clientY, active.pivotX, active.pivotY);
    active.latest = rotationFromPointer(active.startRotation, active.startAngle, angle, event.shiftKey);
    setRotationPreview({ id: active.id, angle: active.latest });
  };
  const finishRotation = (event) => {
    const active = rotateRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    rotateRef.current = null;
    setRotationPreview(null);
    if (active.latest !== active.startRotation) onEdit({ key: 'rotation', id: active.id, value: active.latest });
  };
  const cancelRotation = () => { rotateRef.current = null; setRotationPreview(null); };

  const performExport = async (format) => {
    if (previewLocked || exportBusy) return;
    setExportOpen(false);
    setExportError('');
    try {
      if (format === 'svg') exportRefinementSvg(working, project.name || 'Intenta-design');
      else {
        setExportBusy(true);
        await exportRefinementPng(working, project.name || 'Intenta-design');
      }
    } catch (error) {
      setExportError(error?.message || 'Could not export the current design.');
    } finally { setExportBusy(false); }
  };

  const submitRequest = (event) => {
    event.preventDefault();
    if (!promptDraft.trim() || previewLocked) return;
    setExportOpen(false);
    onChange(proposeRefinementRequest(draft));
  };

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
        <div className="phase4-canvas-actions">
          <div className="phase4-tool-switch" role="group" aria-label="Canvas interaction tool">
            <button type="button" className={!pointMode ? 'is-active' : ''} aria-pressed={!pointMode} disabled={previewLocked} onClick={() => update({ toolMode: 'edit' })} title="Select and drag card objects">↖ Edit</button>
            <button type="button" className={pointMode ? 'is-active' : ''} aria-pressed={pointMode} disabled={previewLocked} onClick={() => update({ toolMode: 'point', conversationOpen: true })} title="Place numbered pointers on the card">⊙ Point</button>
          </div>
          <div className="phase4-zoom-controls" role="group" aria-label="Canvas zoom">
            <button type="button" onClick={() => update({ zoom: nextRefinementZoom(zoom, -1) })}
              disabled={zoom <= MIN_REFINEMENT_ZOOM} title="Zoom out (Ctrl + -)" aria-label="Zoom out">−</button>
            <button type="button" className="phase4-zoom-level" onClick={() => update({ zoom: 100 })}
              title="Reset zoom to 100%" aria-label={`Canvas zoom ${zoom}%. Reset to 100%`}>{zoom}%</button>
            <button type="button" onClick={() => update({ zoom: nextRefinementZoom(zoom, 1) })}
              disabled={zoom >= MAX_REFINEMENT_ZOOM} title="Zoom in (Ctrl + +)" aria-label="Zoom in">+</button>
          </div>
          <div className="phase4-history-controls" role="group" aria-label="Edit history">
            <button type="button" className="phase4-outline-button" onClick={onUndo}
              disabled={previewLocked || !draft.history?.length} title="Undo last manual edit">↶ Undo</button>
            <button type="button" className="phase4-outline-button" onClick={onRedo}
              disabled={previewLocked || !draft.future?.length} title="Redo undone manual edit">↷ Redo</button>
          </div>
          <div className="phase4-export-control" ref={exportRef}>
            <button type="button" className="phase4-outline-button phase4-export-trigger"
              aria-expanded={exportOpen} aria-haspopup="true" disabled={previewLocked || exportBusy}
              title={previewLocked ? 'Accept or reject the proposal before exporting' : 'Download the current design to your computer'}
              onClick={() => { setExportError(''); setExportOpen(!exportOpen); }}>
              {exportBusy ? 'Exporting…' : '↓ Export ▾'}
            </button>
            {exportOpen && !previewLocked && <div className="phase4-export-menu">
              <button type="button" onClick={() => performExport('png')}>Download PNG <small>High resolution · 1380 × 863</small></button>
              <button type="button" onClick={() => performExport('svg')}>Download SVG <small>Vector · scalable artwork</small></button>
              <p>No cloud upload. Only the current working card is exported.</p>
            </div>}
          </div>
        </div>
      </div>
      {exportError && <p className="phase4-export-error" role="alert">{exportError}</p>}
      <div className="phase4-canvas-board" onClick={(event) => {
        // Click-away clears object/background selection, not annotation pointers.
        // Card clicks and proposal controls keep their existing interactions.
        const clickedBlankSpace = event.target === event.currentTarget || event.target.classList?.contains('phase4-canvas-caption');
        if (!clickedBlankSpace) return;
        const nextDraft = deselectRefinementOnBoard(draft);
        if (nextDraft !== draft) onChange(nextDraft);
      }}>
        {previewLocked && <div className="phase4-preview-toolbar" role="status">
          <span><strong>{previewVisible ? 'Proposed change' : 'Current design'}</strong> · Nothing applied yet</span>
          <button type="button" onClick={() => update({ previewVisible: !previewVisible })}>
            {previewVisible ? 'Show current design' : 'Show proposed change'}
          </button>
        </div>}
        <div ref={cardRef}
          className={`phase4-business-card phase4-style-${cardWorking.styleId || 'minimal'} phase4-layout-${cardWorking.layout || 'structured'} ${!previewLocked && selectedIds.includes('background') && !pointMode ? 'phase4-background-selected' : ''} ${pointMode && !previewLocked ? 'is-point-mode' : ''} ${previewLocked ? 'is-preview-locked' : ''}`}
          style={{ backgroundColor: cardWorking.background, color: cardWorking.foreground || cardWorking.objects.name.color, fontFamily: cardWorking.typography === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif', zoom: `${zoom}%` }}
          onClick={(event) => { if (previewLocked) return; if (pointMode) putPointer(event, 'background'); else toggle('background'); }}
          role="button" tabIndex={0} aria-label={pointMode ? 'Place pointer on business-card background' : 'Select card background'}
          aria-pressed={!pointMode && selectedIds.includes('background')}
          onKeyDown={(event) => { if (!previewLocked && event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault(); if (pointMode) putPointer({ detail: 0 }, 'background'); else toggle('background');
          } }}
        >
          {Object.entries(cardWorking.objects).filter(([, object]) => object.visible !== false).map(([id, object]) => {
            const position = dragPreview?.id === id ? dragPreview : object;
            const kind = objectKind(id);
            return <button key={id} type="button"
              data-phase4-object-id={id}
              className={`phase4-card-object phase4-card-object-${kind} ${kind === 'decorations' ? `phase4-decoration-${object.shape || 'stripe'}` : ''} ${!pointMode && !previewLocked && selectedIds.includes(id) ? 'is-selected' : ''} ${!pointMode && !previewLocked ? 'is-draggable' : ''}`}
              style={{ left: `${position.x}%`, top: `${position.y}%`, color: object.color, '--object-size': `${object.size / 6.9}cqw`, '--decoration-color': object.color,
                '--object-rotation': `${rotationPreview?.id === id ? rotationPreview.angle : normaliseRefinementRotation(object.rotation)}deg` }}
              aria-label={`${pointMode ? 'Place pointer on' : 'Select'} ${objectLabel(id)}`} aria-pressed={!pointMode && selectedIds.includes(id)}
              onPointerDown={(event) => beginDrag(event, id)}
              onPointerMove={(event) => moveDrag(event, id)}
              onPointerUp={(event) => finishDrag(event, id)}
              onPointerCancel={cancelDrag}
              onClick={(event) => {
                event.stopPropagation();
                if (previewLocked) return;
                if (ignoreNextClickRef.current) { ignoreNextClickRef.current = false; return; }
                if (pointMode) putPointer(event, id); else toggle(id);
              }}>
              {kind === 'decorations' ? <span className="phase4-shape-fill" aria-hidden="true" /> : object.text}
            </button>;
          })}
          {!pointMode && !previewLocked && first && <button type="button"
            className="phase4-rotation-handle"
            style={{ left: `clamp(16px, ${first.x}%, calc(100% - 16px))`,
              top: `clamp(16px, calc(${first.y}% - 30px), calc(100% - 16px))` }}
            aria-label={`Drag to rotate ${objectLabel(selectedObjects[0])}`}
            title="Drag to rotate · Hold Shift to snap every 15°"
            onPointerDown={(event) => beginRotation(event, selectedObjects[0])}
            onPointerMove={moveRotation}
            onPointerUp={finishRotation}
            onPointerCancel={cancelRotation}
            onClick={(event) => event.stopPropagation()}>↻</button>}
          {pointers.map((pointer, index) => <button key={pointer.id} type="button"
            className="phase4-pointer-pin"
            style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
            title={`Remove pointer ${index + 1} — ${pointer.label}`}
            aria-label={`Remove pointer ${index + 1}, ${pointer.label}`}
            disabled={previewLocked} onClick={(event) => { event.stopPropagation(); onChange(removeRefinementPointer(draft, pointer.id)); }}>
              {index + 1}
            </button>)}
        </div>
        <p className="phase4-canvas-caption">{previewLocked ? 'Compare proposed and current designs, then Accept or Reject in the conversation. Editing is paused until you decide.' : pointMode
          ? 'Click anywhere on the card to place numbered pointers. Click a pin or its chip to remove it; then describe your requested changes in AI Conversation.'
          : 'Click objects to select or drag them. Use the ↻ handle or Rotate controls to turn a selected element. Point mode places annotations.'}</p>
      </div>
      <div className={`phase4-object-properties ${propertiesExpanded ? '' : 'is-collapsed'}`}>
        <div className="phase4-properties-heading">
          <h3>Quick properties</h3>
          <div className="phase4-properties-heading-tools">
            <span>{pointMode ? 'Point & Describe mode' : selectedIds.length ? `${selectedIds.length} selected` : 'No selection'}</span>
            <button type="button" className="phase4-properties-toggle" aria-expanded={propertiesExpanded}
              aria-controls="phase4-properties-body"
              aria-label={propertiesExpanded ? 'Collapse quick properties' : 'Expand quick properties'}
              onClick={() => setPropertiesExpanded((open) => !open)}>
              {propertiesExpanded ? '▾ Hide' : '▸ Show'}
            </button>
          </div>
        </div>
        <div className="phase4-properties-body" id="phase4-properties-body" hidden={!propertiesExpanded}>
          {previewLocked ? <p className="phase4-muted">Preview pending. Accept or reject it before editing.</p>
            : pointMode ? <p className="phase4-muted">Use pointers to mark the card, then describe your changes in AI Conversation.</p>
            : <>
              {(selectedIds.length > 0 || working.objects.contact?.visible === false) && <div className="phase4-properties-selection-row">
                {selectedIds.length > 0 && <div className="phase4-selected-targets">
                  {selectedIds.map((id) => <button key={id} type="button" className="phase4-target-chip" onClick={() => toggle(id)} aria-label={`Remove ${objectLabel(id)} selection`}>{objectLabel(id)} <span aria-hidden="true">×</span></button>)}
                </div>}
                {selectedObjects.length > 0 && <div className="phase4-selection-actions" role="group" aria-label="Selected element actions">
                  <button type="button" className="phase4-outline-button" onClick={() => onEdit({ key: 'duplicate', ids: selectedObjects })}
                    title="Make a movable copy of every selected element">⧉ Duplicate {selectedObjects.length > 1 ? `(${selectedObjects.length})` : ''}</button>
                  <button type="button" className="phase4-outline-button phase4-delete-action" onClick={() => onEdit({ key: 'delete', ids: selectedObjects })}
                    title="Remove selected elements from this working design. Undo to restore them.">✕ Delete {selectedObjects.length > 1 ? `(${selectedObjects.length})` : ''}</button>
                </div>}
                {selectedIds.includes('contact') && working.objects.contact?.visible !== false && <button type="button" className="phase4-add-contact" onClick={() => onEdit({ key: 'visibility', id: 'contact', value: false })}>Hide contact information</button>}
                {working.objects.contact?.visible === false && <button type="button" className="phase4-add-contact" onClick={() => onEdit({ key: 'visibility', id: 'contact', value: true })}>+ Add contact information</button>}
              </div>}
              {selectedIds.length > 0 ? <div className="phase4-property-controls">
                {selectedIds.includes('background') && <label>Background colour <input type="color" value={working.background} onChange={(e) => onEdit({ key: 'background', value: e.target.value })} /></label>}
                {selectedObjects.length > 0 && <>
                  <label>Element colour <input type="color" value={first?.color || working.objects[selectedObjects[0]]?.color || '#000000'} onChange={(e) => onEdit({ key: 'color', value: e.target.value })}/></label>
                  <label>Size <input type="range" min={selectedObjects.some((id) => objectKind(id) === 'divider') ? 120 : selectedObjects.some((id) => objectKind(id) === 'decorations') ? 40 : 8} max={selectedObjects.some((id) => objectKind(id) === 'divider') ? 650 : selectedObjects.some((id) => objectKind(id) === 'decorations') ? 520 : selectedObjects.some((id) => ['logo', 'mark'].includes(objectKind(id))) ? 110 : 70} value={first?.size || working.objects[selectedObjects[0]]?.size || 20} onChange={(e) => onEdit({ key: 'size', value: Number(e.target.value) })}/></label>
                  <div className="phase4-rotation-controls" role="group" aria-label="Rotate selected elements">
                    <span>Rotate</span>
                    <button type="button" title="Rotate 15° counter-clockwise" aria-label="Rotate selected elements 15 degrees counter-clockwise" onClick={() => onEdit({ key: 'rotationDelta', value: -15 })}>↶ 15°</button>
                    <input type="number" aria-label="Rotation angle in degrees" min="-180" max="180" step="1"
                      key={first ? `${selectedObjects[0]}-${firstRotation}` : 'mixed-rotation'}
                      defaultValue={first ? firstRotation : ''} disabled={!first}
                      placeholder={first ? '' : 'Mixed'}
                      onBlur={(event) => {
                        const raw = event.currentTarget.value.trim();
                        if (raw !== '' && Number.isFinite(Number(raw))) onEdit({ key: 'rotation', value: Number(raw) });
                      }}
                      onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
                    <span>°</span>
                    <button type="button" title="Rotate 15° clockwise" aria-label="Rotate selected elements 15 degrees clockwise" onClick={() => onEdit({ key: 'rotationDelta', value: 15 })}>15° ↷</button>
                    <button type="button" title="Reset selected elements to 0°" onClick={() => onEdit({ key: 'rotation', value: 0 })}>Reset</button>
                  </div>
                  {first && !['decorations', 'divider'].includes(objectKind(selectedObjects[0])) && <label className="phase4-text-property">Text <input type="text" value={first.text} onChange={(e) => onEdit({ key: 'text', value: e.target.value })} /></label>}
                </>}
              </div> : working.objects.contact?.visible !== false
                ? <p className="phase4-muted">Select an element to edit it. Click the grey canvas to clear a selection.</p>
                : null}
            </>}
        </div>
      </div>
    </section>

    <aside className={`phase4-conversation ${conversationOpen ? 'is-open' : 'is-collapsed'}`} aria-label="AI refinement conversation">
      {conversationOpen ? <>
        <div className="phase4-panel-header">
          <h2>AI Refinement Conversation</h2>
          <button type="button" className="phase4-icon-button" onClick={() => update({ conversationOpen: false })}
            aria-label="Collapse AI conversation" title="Collapse AI conversation">→</button>
        </div>
        <div className="phase4-conversation-history" aria-live="polite">
          <div className="phase4-assistant-message"><strong>Intenta</strong>
            <p>Select an object in Edit mode, or mark it with Point mode, then ask for a colour, size or position change.</p>
            <p>Intenta previews supported edits before you choose to accept or reject them. This is a rule-based prototype, not a generative image editor.</p>
          </div>
          {refinementMessages.map((message) => <div className="phase4-user-request" key={message.id}>
            <div className="phase4-request-meta">You · Refinement request</div>
            <p>{message.text}</p>
            {message.targets.length ? <div className="phase4-request-targets">
              {message.targets.map((target) => <span key={target.pointerId} className="phase4-recorded-target">#{target.number} {target.label} ({Math.round(target.x)}%, {Math.round(target.y)}%)</span>)}
            </div> : <span className="phase4-muted">General request · No location selected</span>}
            {message.details?.length > 0 && <div className="phase4-change-details">{message.details.map((detail, i) => <span key={i}>{detail}</span>)}</div>}
            <div className={`phase4-request-status phase4-status-${message.status || 'recorded'}`}>
              {message.status === 'proposed' ? 'Preview ready · Not applied' :
                message.status === 'accepted' ? 'Accepted · Applied to working design' :
                message.status === 'rejected' ? 'Rejected · Working design unchanged' :
                message.status === 'unsupported' ? 'Cannot preview this instruction' : 'Recorded · Not applied'}
            </div>
            {message.explanation && <p className="phase4-request-explanation">{message.explanation}</p>}
            {message.status === 'proposed' && pendingProposal?.messageId === message.id && <div className="phase4-proposal-actions">
              <button type="button" className="phase4-primary" onClick={() => onChange(acceptRefinementProposal(draft))}>Accept changes</button>
              <button type="button" className="phase4-outline-button" onClick={() => onChange(rejectRefinementProposal(draft))}>Reject</button>
            </div>}
          </div>)}
          {!pointMode && selectedIds.length > 0 && <div className="phase4-selection-message">Editing: {selectedIds.map((id) => objectLabel(id)).join(', ')}</div>}
        </div>
        <form className="phase4-conversation-composer" onSubmit={submitRequest}>
          <label htmlFor="phase4-prompt">Describe a refinement</label>
          {pointers.length > 0 && <div className="phase4-composer-targets" aria-label="Current pointer targets">
          {pointers.map((pointer, index) => <button key={pointer.id} type="button" className="phase4-target-chip"
              disabled={previewLocked} onClick={() => onChange(removeRefinementPointer(draft, pointer.id))}
              aria-label={`Remove pointer ${index + 1}, ${pointer.label}`}>
              #{index + 1} {pointer.label} <span aria-hidden="true">×</span>
            </button>)}
            <button type="button" className="phase4-clear-pointers" disabled={previewLocked} onClick={() => onChange(clearRefinementPointers(draft))}>Clear pointers</button>
          </div>}
          {!pointMode && !pointers.length && selectedIds.length > 0 && <div className="phase4-composer-targets" aria-label="Selected objects for instruction">
            {selectedIds.map((id, index) => <button key={id} type="button" className="phase4-target-chip" disabled={previewLocked}
              onClick={() => toggle(id)} aria-label={`Remove ${objectLabel(id)} selection from next request`}>
              #{index + 1} {objectLabel(id)} <span aria-hidden="true">×</span>
            </button>)}
          </div>}
          <textarea id="phase4-prompt" value={promptDraft} disabled={previewLocked} onChange={(event) => update({ promptDraft: event.target.value })}
            placeholder="e.g. Make the marked text larger and move it down…" rows={3}/>
          <div className="phase4-composer-actions">
            <span>{pointers.length ? `${pointers.length} location${pointers.length === 1 ? '' : 's'} linked`
              : !pointMode && selectedIds.length ? `${selectedIds.length} selected object${selectedIds.length === 1 ? '' : 's'}`
              : 'No targets · General instruction'}</span>
            <button type="submit" className="phase4-primary" disabled={previewLocked || !promptDraft.trim()}>Preview changes</button>
          </div>
          <p>Supported: named/hex colours, larger/smaller, move up/down/left/right. Changes apply only after your approval. Unsupported requests are explained.</p>
        </form>
      </> : <button type="button" className="phase4-conversation-opener" onClick={() => update({ conversationOpen: true })}
        aria-label="Expand AI conversation" title="Expand AI conversation">
        <span aria-hidden="true" className="phase4-conversation-opener-icon">✦</span>
        <span className="phase4-conversation-opener-label">AI Chat</span>
      </button>}
    </aside>
  </div>;
}
