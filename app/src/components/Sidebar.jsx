
const navigation = [
  { icon: '⌂', label: 'Home', enabled: true },
  { icon: '◷', label: 'Running Tasks', enabled: false },
  { icon: '▤', label: 'Projects', enabled: false },
  { icon: '◎', label: 'Community', enabled: true },
  { icon: '▥', label: 'Library', enabled: false },
];

export default function Sidebar({
  projects,
  activeId,
  onNewProject,
  onSelectProject,
  onHome,
  onCommunity,
  communityActive = false,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">✳</div>
        <span>Intenta</span>
      </div>

      <div className="sidebar-scroll">
        <button
          className="new-project-button"
          onClick={onNewProject}
        >
          <span>＋</span> New Project
        </button>

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >
          {navigation.map((item) => {
            const isActive =
              (item.label === 'Home' && !communityActive) ||
              (item.label === 'Community' && communityActive);

            const handleClick =
              item.label === 'Home'
                ? onHome
                : item.label === 'Community'
                  ? onCommunity
                  : undefined;

            return (
              <button
                key={item.label}
                className={`nav-item ${isActive ? 'active' : ''}`}
                disabled={!item.enabled}
                title={
                  !item.enabled
                    ? 'Coming in a later phase'
                    : ''
                }
                onClick={handleClick}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}

                {!item.enabled && (
                  <span className="soon-dot" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="recent-heading">
          Recent Projects
        </div>

        <div className="recent-list">
          {projects.length === 0 ? (
            <p className="empty-projects">
              No projects yet
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                className={`recent-item ${
                  project.id === activeId && !communityActive
                    ? 'selected'
                    : ''
                }`}
                onClick={() => onSelectProject(project.id)}
              >
                <span>▧</span>
                <span>{project.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          className="footer-item"
          disabled
          title="Coming later"
        >
          <span className="avatar">U</span>
          <span>User Account</span>
        </button>

        <button
          className="settings-button"
          disabled
          title="Coming later"
        >
          ⚙
        </button>
      </div>
    </aside>
  );
}
