import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const suggestions = [
  {
    label: 'Business card',
    prompt:
      'I want to design a business card for my small business. I want it to look professional but creative, although I am not sure about the style yet.',
  },
  {
    label: 'Poster design',
    prompt:
      'I want to design a creative poster, but I am still exploring the colours and visual style.',
  },
  {
    label: 'Logo design',
    prompt:
      'I need a logo for a small brand. I want something memorable and modern.',
  },
  {
    label: 'Surprise me',
    prompt:
      'Help me explore some creative visual design ideas. I am not sure where to start.',
  },
];

export default function PromptComposer({
  prompt,
  assistance,
  onPromptChange,
  onAssistanceChange,
  onSubmit,
}) {
  const promptRef = useRef(null);

  // Resize to content rather than expanding merely because the field is focused.
  // Cap the height so longer prompts never take over a short laptop screen.
  const measurePrompt = useCallback(() => {
    const field = promptRef.current;
    if (!field) return;

    const screenHeight = window.innerHeight;
    const maxHeight = Math.min(260, Math.max(112, Math.floor(screenHeight * 0.32)));

    field.style.height = 'auto';
    const contentHeight = field.scrollHeight;
    field.style.height = `${Math.min(contentHeight, maxHeight)}px`;
    field.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useLayoutEffect(() => {
    measurePrompt();
  }, [prompt, measurePrompt]);

  useEffect(() => {
    const field = promptRef.current;
    const container = field?.parentElement;
    if (!container) return undefined;

    // Width can change when Current Intentions is opened, even without a window resize.
    let lastWidth = container.getBoundingClientRect().width;
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          const width = container.getBoundingClientRect().width;
          if (Math.abs(width - lastWidth) > 1) {
            lastWidth = width;
            measurePrompt();
          }
        });

    observer?.observe(container);
    window.addEventListener('resize', measurePrompt);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measurePrompt);
    };
  }, [measurePrompt]);

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
              onChange={(event) => onAssistanceChange(event.target.checked)}
            />
            <span className="toggle-track" aria-hidden="true" />
            <span>Prompt assistance</span>
          </label>
          <span className="optional-label">Optional</span>
        </div>

        <textarea
          ref={promptRef}
          className="prompt-textarea"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Describe what you'd like to create... It's okay if your idea is still vague."
          aria-label="Your creative design prompt"
          rows={1}
        />

        <div className="composer-bottom">
          <span className="composer-hint">
            {assistance
              ? 'Assistance on · You will review before submitting'
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
              className={`send-button ${assistance ? 'review-prompt-button' : ''}`}
              disabled={!prompt.trim()}
              aria-label={assistance ? 'Review prompt before submitting' : 'Submit design prompt'}
              title={assistance ? 'Review prompt' : 'Submit prompt'}
            >
              {assistance ? 'Review prompt' : '↑'}
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
