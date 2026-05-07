type RefreshExecutor = () => Promise<string | null>;

let refreshPromise: Promise<string | null> | null = null;
let refreshGeneration = 0;

export const authRefresh = {
  async withRefreshLock(executor: RefreshExecutor): Promise<string | null> {
    const currentGeneration = refreshGeneration;
    if (!refreshPromise) {
      refreshPromise = executor().finally(() => {
        if (currentGeneration === refreshGeneration) {
          refreshPromise = null;
        }
      });
    }
    return refreshPromise;
  },
  clearPending(): void {
    refreshGeneration += 1;
    refreshPromise = null;
  },
};
