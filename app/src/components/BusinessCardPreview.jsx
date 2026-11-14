/** A CSS-based visual sample. Selectable objects arrive in Phase 4. */
export default function BusinessCardPreview({ concept }) {
  return (
    <div
      className={`business-card-preview preview-${concept.styleId} preview-layout-${concept.layout}`}
      style={{
        '--card-bg': concept.background,
        '--card-fg': concept.foreground,
        '--card-accent': concept.accent,
        fontFamily: concept.typography === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
      }}
      role="img"
      aria-label={`${concept.name} business-card mock-up in ${concept.palette}; ${concept.typography === 'serif' ? 'serif' : 'sans-serif'} typography and ${concept.layout} layout`}
    >
      <span className="preview-decoration" aria-hidden="true" />
      <div className="preview-topline">
        <span className="preview-brand">{concept.brand}</span>
        <span className="preview-mark" aria-hidden="true">
          {concept.styleId === 'botanical' ? '✳' : concept.styleId === 'minimal' ? '◩' : '✦'}
        </span>
      </div>
      <div className="preview-person">
        <span className="preview-person-name">ALEX MORGAN</span>
        <span className="preview-person-role">{concept.role}</span>
      </div>
    </div>
  );
}
