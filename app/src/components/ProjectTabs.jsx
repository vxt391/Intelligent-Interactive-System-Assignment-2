
export default function ProjectTabs({
  projects,
  activeId,
  onSelect,
  onClose,
  onNew,
}) {
  return (
    <div className="tabs-bar" aria-label="Open projects">
      <div className="tabs-scroll">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`project-tab ${
              activeId === project.id ? 'active' : ''
            }`}
          >
            <button
              className="tab-name"
              onClick={() => onSelect(project.id)}
              aria-current={activeId === project.id ? 'page' : undefined}
            >
              {project.name}
            </button>
            <button
              className="tab-close"
              onClick={() => onClose(project.id)}
              aria-label={`Close ${project.name}`}
              title="Close project"
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="add-tab"
          onClick={onNew}
          aria-label="New project"
          title="New project"
        >
          ＋
        </button>
      </div>
    </div>
  );
}
