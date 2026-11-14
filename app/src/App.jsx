import { useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import ProjectTabs from './components/ProjectTabs';
import ModeSwitcher from './components/ModeSwitcher';
import PromptComposer from './components/PromptComposer';
import FeaturePlaceholder from './components/FeaturePlaceholder';
import ConversationView from './components/ConversationView';
import IntentionPanel from './components/IntentionPanel';
import PromptAssistancePanel from './components/PromptAssistancePanel';
import { suggestImprovedPrompt } from './utils/promptAssistance';
import './App.css';
import './Phase2.css';

function createProject(id) {
  return {
    id,
    name: `Project ${id}`,
    mode: 'explore',
    prompt: '',
    assistance: false,
    promptReview: null, // Only exists while the user reviews a suggested prompt.
    messages: [],
    nextMessageId: 1,
    intentions: {
      initialBrief: '',
      preferences: [], // Confirmed attributes will be added in a later Phase 2 step.
    },
    exploration: {
      strategy: 'new-directions',
      selectedConceptId: null,
      round: 0,
      uncertaintyStreak: 0,
      communitySuggestionDismissed: false,
    },
    ui: { intentionsOpen: false },
  };
}

function App() {
  const [projects, setProjects] = useState([createProject(1)]);
  const [activeId, setActiveId] = useState(1);
  const nextProjectId = useRef(2);

  const activeProject = projects.find((project) => project.id === activeId);

  function updateProject(changes) {
    setProjects((current) =>
      current.map((project) =>
        project.id === activeId ? { ...project, ...changes } : project
      )
    );
  }

  function newProject() {
    const id = nextProjectId.current++;
    setProjects((current) => [...current, createProject(id)]);
    setActiveId(id);
  }

  function selectProject(id) {
    setActiveId(id);
  }

  function closeProject(id) {
    const remaining = projects.filter((project) => project.id !== id);
    setProjects(remaining);
    if (activeId === id) {
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  function submitPrompt(text, originalText = text, submission = 'without-assistance') {
    const submitted = text.trim();
    const original = originalText.trim();
    if (!submitted || !original) return;

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== activeId) return project;

        const firstMessage = project.messages.length === 0;
        const additions = [
          {
            id: project.nextMessageId,
            role: 'user',
            text: submitted,
            promptMeta: {
              original,
              submission, // 'suggested', 'original', or 'without-assistance'
            },
          },
        ];

        if (firstMessage) {
          additions.push({
            id: project.nextMessageId + 1,
            role: 'prototype',
            text: 'Your design brief has been saved. Design recommendations are not active yet; optional prompt assistance uses a rule-based simulation.',
          });
        }

        return {
          ...project,
          prompt: '',
          promptReview: null,
          messages: [...project.messages, ...additions],
          nextMessageId: project.nextMessageId + additions.length,
          intentions: {
            ...project.intentions,
            // Save the initial ORIGINAL wording even if an edited suggestion was submitted.
            initialBrief: project.intentions.initialBrief || original,
          },
        };
      })
    );
  }

  function handleComposerSubmit() {
    if (!activeProject) return;
    const original = activeProject.prompt.trim();
    if (!original) return;

    if (activeProject.assistance) {
      // Don't overwrite an in-progress edit if Review is clicked again.
      if (activeProject.promptReview?.original === original) return;
      updateProject({
        promptReview: {
          original,
          suggested: suggestImprovedPrompt(original),
        },
      });
    } else {
      submitPrompt(original);
    }
  }

  function renderComposer(compact = false) {
    if (!activeProject) return null;
    const review = activeProject.promptReview;

    return (
      <div className={compact ? 'compact-composer' : ''}>
        <PromptComposer
          prompt={activeProject.prompt}
          assistance={activeProject.assistance}
          onPromptChange={(prompt) => updateProject({ prompt, promptReview: null })}
          onAssistanceChange={(assistance) =>
            updateProject({ assistance, promptReview: null })
          }
          onSubmit={handleComposerSubmit}
        />
        {review && (
          <PromptAssistancePanel
            original={review.original}
            suggested={review.suggested}
            onSuggestedChange={(suggested) =>
              updateProject({ promptReview: { ...review, suggested } })
            }
            onUseOriginal={() => submitPrompt(review.original, review.original, 'original')}
            onUseSuggested={() => submitPrompt(review.suggested, review.original, 'suggested')}
            onBack={() => updateProject({ promptReview: null })}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        activeId={activeId}
        onNewProject={newProject}
        onSelectProject={selectProject}
        onHome={() => updateProject({ mode: 'explore' })}
      />

      <div className="main-area">
        <ProjectTabs
          projects={projects}
          activeId={activeId}
          onSelect={selectProject}
          onClose={closeProject}
          onNew={newProject}
        />

        <main className="workspace phase2-workspace">
          {activeProject ? (
            <>
              <div className="workspace-toolbar">
                <ModeSwitcher
                  mode={activeProject.mode}
                  onChange={(mode) => updateProject({ mode })}
                />
                <div className="phase2-toolbar-right">
                  <span className="workspace-status">
                    {activeProject.name} · Draft workspace
                  </span>
                  <button
                    type="button"
                    className="intentions-toggle"
                    aria-expanded={activeProject.ui.intentionsOpen}
                    aria-controls="current-intentions-panel"
                    onClick={() =>
                      updateProject({
                        ui: {
                          ...activeProject.ui,
                          intentionsOpen: !activeProject.ui.intentionsOpen,
                        },
                      })
                    }
                  >
                    Current Intentions ({activeProject.intentions.preferences.length})
                    <span aria-hidden="true">
                      {activeProject.ui.intentionsOpen ? ' ×' : ' ☰'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="phase2-content">
                <div className="phase2-primary">
                  {activeProject.mode === 'explore' ? (
                    activeProject.messages.length === 0 ? (
                      <section className="welcome-section">
                        <div className="eyebrow">YOUR CREATIVE SPACE</div>
                        <h1>What do you want to design today?</h1>
                        <p className="welcome-description">
                          Start with an idea, even if you're not sure about the details yet.
                        </p>
                        {renderComposer()}
                      </section>
                    ) : (
                      <ConversationView
                        messages={activeProject.messages}
                        composer={renderComposer(true)}
                      />
                    )
                  ) : (
                    <FeaturePlaceholder
                      title="Direct Object Refinement"
                      description="This workspace will let you select design objects and request precise changes."
                      note="Interactive canvas and object markers arrive in Phase 4."
                    />
                  )}
                </div>

                {activeProject.ui.intentionsOpen && (
                  <IntentionPanel
                    intentions={activeProject.intentions}
                    onClose={() =>
                      updateProject({
                        ui: { ...activeProject.ui, intentionsOpen: false },
                      })
                    }
                  />
                )}
              </div>
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
