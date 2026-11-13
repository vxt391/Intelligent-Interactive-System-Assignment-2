
export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="mode-switcher" aria-label="Interaction mode">
      <button
        className={`mode-button ${mode === 'explore' ? 'active' : ''}`}
        onClick={() => onChange('explore')}
        aria-pressed={mode === 'explore'}
      >
        <span>◇</span> Explore Ideas
      </button>
      <button
        className={`mode-button ${mode === 'refine' ? 'active' : ''}`}
        onClick={() => onChange('refine')}
        aria-pressed={mode === 'refine'}
      >
        <span>↗</span> Refine Design
      </button>
    </div>
  );
}
