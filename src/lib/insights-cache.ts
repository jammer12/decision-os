export const INSIGHTS_CACHE_KEY = "decision-os-insights";

export function clearInsightsCache(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(INSIGHTS_CACHE_KEY);
  } catch {
    // ignore
  }
}
