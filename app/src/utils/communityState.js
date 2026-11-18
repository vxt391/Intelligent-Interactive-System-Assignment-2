// Shared Community state factory, separate from the React component for Fast Refresh.
export const createCommunityState = () => ({
  view: 'gallery', // gallery | detail | saved
  returnView: 'gallery',
  selectedProjectId: null,
  category: 'Discover',
  query: '',
  style: 'All styles',
  sort: 'featured',
  showFilters: false,
  drafts: {}, // Unsaved attribute selections scoped by artwork ID.
  saved: {}, // Explicitly confirmed inspiration, independent of projects.
  reviewOpen: false,
  removalId: null,
  // Session-only transfer draft. No design project is edited until final confirmation.
  transferRequest: null, // { artworkId, targetProjectId, stage, selectedIds, resolutions, referenceOnly }
  connectionNotice: null, // Explicitly confirmed transfer success; does not redirect.
  scrollPositions: { gallery: 0, saved: 0 },
});
