/**
 * Combine explicitly confirmed ratings with the current project preferences.
 * One active status per stable attribute ID. No unconfirmed items enter here.
 * Returns new objects so past confirmation events remain immutable snapshots.
 */
export function mergeConfirmedPreferences(existing, ratedItems) {
  const byId = new Map(existing.map((preference) => [preference.id, { ...preference }]));
  const changes = [];

  for (const item of ratedItems) {
    if (!['like', 'avoid', 'unsure'].includes(item.sentiment)) continue;
    const previous = byId.get(item.id);
    const next = {
      id: item.id,
      category: item.category,
      label: item.label,
      value: item.value,
      sentiment: item.sentiment,
    };
    byId.set(item.id, next);
    changes.push({
      ...next,
      previousSentiment: previous?.sentiment ?? null,
    });
  }

  return { preferences: Array.from(byId.values()), changes };
}


/**
 * Create an isolated edit draft from confirmed preferences. This draft is
 * per-project and does not change active preferences until Save Changes.
 */
export function createPreferenceEdit(preferences) {
  return {
    base: preferences.map((item) => ({ ...item })),
    items: preferences.map((item) => ({ ...item, removed: false })),
  };
}

/**
 * Detect only explicit edits/removals relative to the edit session's starting
 * snapshot. That matters if another feedback confirmation happens meanwhile:
 * unedited preferences must not be overwritten by saving this draft.
 */
export function getPreferenceEditChanges(edit) {
  if (!edit) return [];
  const baseById = new Map(edit.base.map((item) => [item.id, item]));
  return edit.items.flatMap((item) => {
    const original = baseById.get(item.id);
    if (!original) return [];
    if (item.removed) return [{ ...original, action: 'removed' }];
    if (item.sentiment !== original.sentiment) {
      return [{ ...original, sentiment: item.sentiment, action: 'updated' }];
    }
    return [];
  });
}

/**
 * Apply only explicitly edited IDs to the latest confirmed preferences.
 * This preserves any unrelated confirmations made while the edit panel was open.
 * Changes describe the EFFECTIVE saved operations for the conversation log.
 */
export function applyPreferenceEdits(existing, edit) {
  const byId = new Map(existing.map((item) => [item.id, { ...item }]));
  const changes = [];

  for (const planned of getPreferenceEditChanges(edit)) {
    const current = byId.get(planned.id);
    if (!current) continue;

    if (planned.action === 'removed') {
      byId.delete(planned.id);
      changes.push({ ...current, action: 'removed', previousSentiment: current.sentiment });
    } else if (['like', 'avoid', 'unsure'].includes(planned.sentiment)
      && current.sentiment !== planned.sentiment) {
      byId.set(planned.id, { ...current, sentiment: planned.sentiment });
      changes.push({
        ...current,
        sentiment: planned.sentiment,
        action: 'updated',
        previousSentiment: current.sentiment,
      });
    }
  }

  return { preferences: [...byId.values()], changes };
}
