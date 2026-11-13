
const suggestions = [
  { label: 'Business card', prompt: 'I want to design a business card for my small business. I want it to look professional but creative, although I am not sure about the style yet.' },
  { label: 'Poster design', prompt: 'I want to design a creative poster, but I am still exploring the colours and visual style.' },
  { label: 'Logo design', prompt: 'I need a logo for a small brand. I want something memorable and modern.' },
  { label: 'Surprise me', prompt: 'Help me explore some creative visual design ideas. I am not sure where to start.' },
];

export default function PromptComposer({
  prompt,
  assistance,
  onPromptChange,
  onAssistanceChange,
  onSubmit,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="composer-area">
      <form className="prompt-box" onSubmit={handleSubmit}>
        <div className="assistance-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={assistance}
              onChange={(event) =>
                onAssistanceChange(event.target.checked)
              }
            />
            <span className="toggle-track" aria-hidden="true" />
            <span>Prompt assistance</span>
          </label>
          <span className="optional-label">Optional</span>
        </div>

        <textarea
          className="prompt-textarea"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Describe what you'd like to create... It's okay if your idea is still vague."
          aria-label="Your creative design prompt"
          rows={4}
        />

        <div className="composer-bottom">
          <span className="composer-hint">
            {assistance
              ? 'Assistance is on · Prompt suggestions arrive in Phase 2'
              : 'Your ideas, your direction.'}
          </span>
          <div className="composer-actions">
            <button
              type="button"
              className="tool-button"
              disabled
              title="Model selection arrives in a later phase"
              aria-label="AI model selection, coming later"
            >
              ◈
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={!prompt.trim()}
              aria-label="Submit design prompt"
              title="Submit prompt"
            >
              ↑
            </button>
          </div>
        </div>
      </form>

      <div className="suggestion-chips">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            className="suggestion-chip"
            onClick={() => onPromptChange(suggestion.prompt)}
          >
            <span>✦</span> {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}
