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
