/** Standard FlatList performance props — use on all long lists. */
export const FLATLIST_PERF = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: 6,
  initialNumToRender: 6,
  updateCellsBatchingPeriod: 50,
  windowSize: 5,
  scrollEventThrottle: 16 as const,
};

export const FLATLIST_PERF_HORIZONTAL = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: 3,
  initialNumToRender: 3,
  updateCellsBatchingPeriod: 50,
  windowSize: 3,
  scrollEventThrottle: 16 as const,
};
