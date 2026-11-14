/**
 * A transparent, deterministic prototype suggestion — NOT an AI model.
 * Keep the user's original wording intact; add only neutral guidance.
 */
export function suggestImprovedPrompt(original) {
  const trimmed = original.trim();
  if (!trimmed) return '';

  const expressesUncertainty =
    /\b(not sure|unsure|uncertain|don't know|do not know|no idea|still exploring|haven't decided|have not decided)\b/i.test(trimmed);

  const guidance = expressesUncertainty
    ? "I'm still exploring my creative preferences. Please show different visual directions and explain how their colour palettes, typography, and layouts relate to the goals I've described. Don't assume preferences I haven't specified."
    : "Please consider how colour, typography, and layout support the requirements I've described. If any important preference is unclear, offer alternatives or ask me instead of making assumptions.";

  return `${trimmed}\n\n${guidance}`;
}
