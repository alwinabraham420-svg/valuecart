// Shared in-memory store for runtime product overrides across API routes
const runtimeProductOverrides = new Map<string, any>();

export function getProductRuntimeOverride(idOrSlug: string) {
  return runtimeProductOverrides.get(idOrSlug);
}

export function setProductRuntimeOverride(key: string, updates: any) {
  const existing = runtimeProductOverrides.get(key) || {};
  const merged = { ...existing, ...updates };
  runtimeProductOverrides.set(key, merged);
  return merged;
}
