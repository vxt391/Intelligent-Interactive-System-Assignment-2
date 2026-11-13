
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProjectTabs from './components/ProjectTabs';
import ModeSwitcher from './components/ModeSwitcher';
import PromptComposer from './components/PromptComposer';
import FeaturePlaceholder from './components/FeaturePlaceholder';
import './App.css';

const createProject = (id) => ({
  id,
  name: `Project ${id}`,
  mode: 'explore',
  prompt: '',
  assistance: false,
  lastSubmittedPrompt: '',
});

function App() {
  const [projects, setProjects] = useState([createProject(1)]);
  const [activeId, setActiveId] = useState(1);
  const [page, setPage] = useState('home');

  const activeProject = projects.find((p) => p.id === activeId);

  function updateProject(changes) {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === activeId
          ? { ...project, ...changes }
          : project
      )
    );
  }

  function newProject() {
    const id = Math.max(0, ...projects.map((p) => p.id)) + 1;
    setProjects((previous) => [...previous, createProject(id)]);
    setActiveId(id);
    setPage('home');
  }

  function selectProject(id) {
    setActiveId(id);
    setPage('home');
  }

  function closeProject(id) {
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);

    if (activeId === id) {
      setActiveId(remaining.length ? remaining[0].id : null);
    }
  }

  function submitPrompt() {
    if (!activeProject?.prompt.trim()) return;

    updateProject({
      lastSubmittedPrompt: activeProject.prompt.trim(),
    });
  }

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        activeId={activeId}
        onNewProject={newProject}
        onSelectProject={selectProject}
        onHome={() => setPage('home')}
      />

      <div className="main-area">
        <ProjectTabs
          projects={projects}
          activeId={activeId}
          onSelect={selectProject}
          onClose={closeProject}
          onNew={newProject}
        />

        <main className="workspace">
          {activeProject ? (
            <>
              <div className="workspace-toolbar">
                <ModeSwitcher
                  mode={activeProject.mode}
                  onChange={(mode) => updateProject({ mode })}
                />
                <span className="workspace-status">
                  {activeProject.name} · Draft workspace
                </span>
              </div>

              {activeProject.mode === 'explore' ? (
                <section className="welcome-section">
                  <div className="eyebrow">YOUR CREATIVE SPACE</div>
                  <h1>What do you want to design today?</h1>
                  <p className="welcome-description">
                    Start with an idea, even if you're not sure
                    about the details yet.
                  </p>

                  <PromptComposer
                    prompt={activeProject.prompt}
                    assistance={activeProject.assistance}
                    onPromptChange={(prompt) => updateProject({ prompt })}
                    onAssistanceChange={(assistance) =>
                      updateProject({ assistance })
                    }
                    onSubmit={submitPrompt}
                  />

                  {activeProject.lastSubmittedPrompt && (
                    <div className="submission-notice" role="status">
                      <strong>Prompt received</strong>
                      <p>{activeProject.lastSubmittedPrompt}</p>
                      <small>
                        Design recommendations will be introduced
                        in Phase 2.
                      </small>
                    </div>
                  )}
                </section>
              ) : (
                <FeaturePlaceholder
                  title="Direct Object Refinement"
                  description="This workspace will let you select design objects and request precise changes."
                  note="Interactive canvas and object markers arrive in Phase 4."
                />
              )}
            </>
          ) : (
            <FeaturePlaceholder
              title="Your creative space is ready"
              description="Create a project to start exploring your design ideas."
              note="Select New Project in the sidebar."
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
