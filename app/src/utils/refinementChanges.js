// Phase 4.3 — deterministic, transparent interpretation of a SMALL subset of
// targeted visual instructions. No model/API calls and no arbitrary image edits.
import { recordRefinementRequest } from './refinementPointers.js';

const COLOURS = Object.freeze({
  'dark blue': '#17365d', 'navy blue': '#17365d', navy: '#17365d',
  'light blue': '#8dc9ec', 'sky blue': '#8dc9ec', blue: '#2563eb',
  'dark green': '#166534', 'light green': '#86efac', green: '#228b55',
  'dark red': '#991b1b', red: '#dc2626', burgundy: '#800020',
  white: '#ffffff', black: '#111111', 'dark grey': '#374151',
  'light grey': '#d1d5db', grey: '#6b7280', gray: '#6b7280',
  purple: '#7c3aed', violet: '#8b5cf6', lilac: '#c4b5fd', pink: '#db2777',
  orange: '#ea580c', yellow: '#eab308', gold: '#b88a31', beige: '#d6c5ad',
  cream: '#fff5df', teal: '#0f766e', brown: '#784d37',
});
const colourKeys = Object.keys(COLOURS).sort((a, b) => b.length - a.length);
const norm = (s) => String(s || '').toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const copy = (obj) => JSON.parse(JSON.stringify(obj));

export function extractRefinementOperations(instruction) {
  const text = norm(instruction);
  if (!text) return { operations: [], error: 'Describe the change you want to make.' };
  // Block compound requests containing edits outside the deliberately supported set.
  if (/\b(rotate|rotation|tilt|gradient|shadow|opacity|blur|crop|remove background|generate|redesign|image|photo|upload|font family|font style|italic|bold|font weight|font-family|centre|center|middle|spacing|alignment|align|animate|border|replace (?:the )?(?:logo|symbol)|draw|sketch)\b/.test(text)) {
    return { operations: [], error: 'Part of this request requires an unsupported operation. Try a colour, size, or move instruction instead.' };
  }
  const operations = [];
  // Conservative colour parsing: require colour vocabulary + a supported colour token.
  const colourIntent = /\b(colou?r|fill|background|make|turn|change|set)\b/.test(text);
  if (colourIntent) {
    const hex = text.match(/#[0-9a-f]{6}\b/i);
    const named = colourKeys.find((name) => new RegExp(`\\b${name.replace(/ /g, '\\s+')}\\b`).test(text));
    if (hex || named) operations.push({ type: 'color', value: hex ? hex[0] : COLOURS[named], description: `Change colour to ${hex?.[0] || named}` });
  }
  const grow = /\b(larger|bigger|increase (?:the )?(?:size|font size)|enlarge|grow)\b/.test(text);
  const shrink = /\b(smaller|decrease (?:the )?(?:size|font size)|shrink|reduce (?:the )?(?:size|font size))\b/.test(text);
  if (grow && shrink) return { operations: [], error: 'This instruction requests both larger and smaller sizes. Please choose one.' };
  if (grow || shrink) operations.push({ type: 'size', factor: grow ? 1.15 : 0.85, description: grow ? 'Increase size by 15%' : 'Decrease size by 15%' });
  const move = /\b(move|shift|nudge)\b/.test(text);
  if (move) {
    const directions = ['left', 'right', 'up', 'down'].filter((d) => new RegExp(`\\b${d}\\b`).test(text));
    if (!directions.length) return { operations: [], error: 'Please specify a move direction: left, right, up, or down.' };
    if ((directions.includes('left') && directions.includes('right')) || (directions.includes('up') && directions.includes('down'))) {
      return { operations: [], error: 'Please choose one horizontal and one vertical direction at most.' };
    }
    const step = /\b(slightly|a little|small amount)\b/.test(text) ? 3 : 6;
    const dx = (directions.includes('right') ? step : 0) - (directions.includes('left') ? step : 0);
    const dy = (directions.includes('down') ? step : 0) - (directions.includes('up') ? step : 0);
    operations.push({ type: 'move', dx, dy, description: `Move ${directions.join(' and ')} by ${step}% of the card` });
  }
  if (!operations.length) return {
    operations: [],
    error: 'This request is not yet supported. Try “Make the selected text larger”, “Change it to dark blue”, or “Move it down”.',
  };
  // Avoid claiming support for unrelated clauses combined with a valid command.
  if (/\b(also (?:add|create|insert|delete|remove)|and (?:add|create|insert|delete|remove)|change (?:the )?text|rewrite|replace (?:the )?text)\b/.test(text)) {
    return { operations: [], error: 'This request mixes supported edits with unsupported content changes. Please submit only colour, size, or movement changes.' };
  }
  return { operations, error: null };
}

function boundsForSize(id, object) {
  const kind = object?.kind || String(id).replace(/-copy-\d+$/, '');
  if (kind === 'divider') return [120, 650];
  if (kind === 'decorations') return [40, 520];
  if (kind === 'logo' || kind === 'mark') return [8, 110];
  return [8, 70];
}

export function planRefinementChange(working, text, targets) {
  const parsed = extractRefinementOperations(text);
  if (parsed.error) return { ok: false, reason: parsed.error };
  const ids = [...new Set((targets || []).map((t) => t.objectId))];
  if (!ids.length) return { ok: false, reason: 'Select a design object or place a pointer on the card before requesting an edit.' };
  if (ids.some((id) => id !== 'background' && !working?.objects?.[id])) return { ok: false, reason: 'One of the selected design objects is no longer available.' };
  const hidden = ids.filter(id => id !== 'background' && working.objects[id].visible === false);
  if (hidden.length) return { ok: false, reason: 'A selected object is hidden. Show it in Edit mode before requesting changes.' };
  const incompatible = parsed.operations.find((operation) =>
    (operation.type === 'move' || operation.type === 'size') && ids.includes('background'));
  if (incompatible) return { ok: false, reason: 'Background cannot be moved or resized. Select a movable element or request a background colour.' };
  const candidate = copy(working);
  for (const operation of parsed.operations) {
    for (const id of ids) {
      if (operation.type === 'color') {
        if (id === 'background') candidate.background = operation.value;
        else candidate.objects[id].color = operation.value;
      } else if (operation.type === 'size') {
        const [min, max] = boundsForSize(id, candidate.objects[id]);
        candidate.objects[id].size = Math.round(clamp(candidate.objects[id].size * operation.factor, min, max));
      } else if (operation.type === 'move') {
        const obj = candidate.objects[id];
        obj.x = Math.round(clamp(obj.x + operation.dx, 2, (obj.kind || id.replace(/-copy-\d+$/, '')) === 'mark' ? 98 : 92) * 10) / 10;
        obj.y = Math.round(clamp(obj.y + operation.dy, 8, 92) * 10) / 10;
      }
    }
  }
  if (JSON.stringify(candidate) === JSON.stringify(working)) {
    return { ok: false, reason: 'The requested change would not alter the current design (possibly because a limit was reached).' };
  }
  return { ok: true, working: candidate, operations: parsed.operations.map(op => op.description), targetIds: ids };
}

// One proposal at a time. Submission records the exact pointer/object targets;
// nothing touches draft.working until the user ACCEPTS the preview.
export function proposeRefinementRequest(draft) {
  if (!draft?.working || draft.pendingProposal || !draft.promptDraft?.trim()) return draft;
  const recorded = recordRefinementRequest(draft);
  const latest = recorded.refinementMessages.at(-1);
  const result = planRefinementChange(draft.working, latest.text, latest.targets);
  const messages = recorded.refinementMessages.map((message) => message.id !== latest.id ? message : {
    ...message, status: result.ok ? 'proposed' : 'unsupported',
    details: result.ok ? result.operations : [],
    explanation: result.ok ? 'Preview ready. No changes have been applied.' : result.reason,
  });
  return {
    ...recorded,
    refinementMessages: messages,
    pendingProposal: result.ok ? { messageId: latest.id, working: result.working, details: result.operations, targetIds: result.targetIds } : null,
    previewVisible: Boolean(result.ok),
    conversationOpen: true,
  };
}

export function acceptRefinementProposal(draft) {
  if (!draft?.pendingProposal) return draft;
  const proposal = draft.pendingProposal;
  if (!draft.refinementMessages?.some((m) => m.id === proposal.messageId && m.status === 'proposed')) return draft;
  return {
    ...draft,
    working: copy(proposal.working),
    history: [...(draft.history || []).slice(-19), { working: copy(draft.working) }],
    future: [],
    refinementMessages: draft.refinementMessages.map(message => message.id === proposal.messageId ? { ...message, status: 'accepted', explanation: 'Applied to working design. Undo is available.' } : message),
    pendingProposal: null,
    previewVisible: false,
  };
}

export function rejectRefinementProposal(draft) {
  if (!draft?.pendingProposal) return draft;
  return {
    ...draft,
    refinementMessages: (draft.refinementMessages || []).map(message => message.id === draft.pendingProposal.messageId ? { ...message, status: 'rejected', explanation: 'Change rejected. Working design unchanged.' } : message),
    pendingProposal: null,
    previewVisible: false,
  };
}
