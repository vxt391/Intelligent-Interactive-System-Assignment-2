
export default function FeaturePlaceholder({
  title,
  description,
  note,
}) {
  return (
    <section className="feature-placeholder">
      <div className="placeholder-icon">✳</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="placeholder-note">{note}</span>
    </section>
  );
}
