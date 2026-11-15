import { useMemo, useState } from 'react';
import { COMMUNITY_CATEGORIES, COMMUNITY_PROJECTS, COMMUNITY_STYLES } from '../data/communityProjects';

/** Phase 3.1: project-independent gallery discovery only. No project mutation. */
export default function CommunityGallery() {
  const [category, setCategory] = useState('Discover');
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('All styles');
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const projects = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const matches = COMMUNITY_PROJECTS.filter((item) => {
      const matchesCategory = category === 'Discover' || item.category === category;
      const matchesStyle = style === 'All styles' || item.style === style;
      const text = [item.title, item.category, item.style, ...item.tags, item.description].join(' ').toLocaleLowerCase();
      return matchesCategory && matchesStyle && (!needle || text.includes(needle));
    });
    return sort === 'az' ? [...matches].sort((a, b) => a.title.localeCompare(b.title)) : matches;
  }, [category, query, style, sort]);

  const clearFilters = () => {
    setCategory('Discover');
    setQuery('');
    setStyle('All styles');
    setSort('featured');
  };

  return (
    <section className="phase3-gallery" aria-labelledby="phase3-title">
      <header className="phase3-gallery-heading">
        <div>
          <p className="phase3-eyebrow">EXPLORE THE CREATIVE WORLD</p>
          <h1 id="phase3-title">Community Inspiration</h1>
          <p>Discover ideas across disciplines. Find what speaks to you — no project required.</p>
        </div>
        <span className="phase3-demo-pill" title="All projects are fictional examples">Curated demo gallery</span>
      </header>

      <div className="phase3-search-toolbar">
        <label className="phase3-search" htmlFor="phase3-gallery-search">
          <span className="phase3-search-symbol" aria-hidden="true">⌕</span>
          <input
            id="phase3-gallery-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, styles or ideas…"
            autoComplete="off"
          />
        </label>
        <button
          type="button"
          className={`phase3-filter-toggle${showFilters ? ' is-active' : ''}`}
          aria-expanded={showFilters}
          aria-controls="phase3-filter-panel"
          onClick={() => setShowFilters((value) => !value)}
        >
          <span aria-hidden="true">☷</span> Filters
          {style !== 'All styles' && <span className="phase3-filter-dot" aria-label="Style filter active" />}
        </button>
        <label className="phase3-sort">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort community projects">
            <option value="featured">Featured</option>
            <option value="az">Title A–Z</option>
          </select>
        </label>
      </div>

      {showFilters && (
        <div id="phase3-filter-panel" className="phase3-filter-panel">
          <label htmlFor="phase3-style-filter">Design style</label>
          <select id="phase3-style-filter" value={style} onChange={(event) => setStyle(event.target.value)}>
            {COMMUNITY_STYLES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button type="button" onClick={clearFilters} className="phase3-clear-link">Clear all filters</button>
        </div>
      )}

      <nav className="phase3-category-nav" aria-label="Creative categories">
        {COMMUNITY_CATEGORIES.map((item) => (
          <button
            type="button"
            key={item}
            className={`phase3-category-chip${category === item ? ' is-selected' : ''}`}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >{item}</button>
        ))}
      </nav>

      <div className="phase3-results-header">
        <h2>{category === 'Discover' ? 'Explore projects' : category}</h2>
        <span aria-live="polite">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
      </div>

      {projects.length ? (
        <div className="phase3-project-grid">
          {projects.map((project) => (
            <article className="phase3-project-card" key={project.id} aria-label={`${project.title}, ${project.category}`}>
              <div className="phase3-project-image">
                <img src={project.image} alt={`${project.title}: illustrative visual project artwork`} loading="lazy" />
              </div>
              <div className="phase3-project-meta">
                <h3>{project.title}</h3>
                <p>{project.category} <span aria-hidden="true">·</span> {project.style}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="phase3-empty" role="status">
          <span aria-hidden="true">✦</span>
          <h3>No matching projects</h3>
          <p>Try another search or clear the filters to explore more ideas.</p>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      <footer className="phase3-gallery-footer">
        This is a curated prototype gallery using original sample artwork, not real community uploads. Project details and transferring inspiration to a design arrive in later milestones.
      </footer>
    </section>
  );
}
