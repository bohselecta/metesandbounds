export type LinkEntry = {
  state: string;
  countyFips: string;
  countyName: string;
  propertySearchUrl: string;
};

export type StateFallbackEntry = {
  state: string;
  url: string;
  label: string;
};

export type RegistryResult = {
  url: string;
  label: string;
  source: "curated" | "state_fallback";
  verified: boolean;
  countyName?: string;
  state: string;
};

import linksJson from "./links.json" with { type: "json" };
import stateFallbacksJson from "./state_fallbacks.json" with { type: "json" };

const links = linksJson as LinkEntry[];
const stateFallbacks = stateFallbacksJson as StateFallbackEntry[];

const key = (state: string, countyFips: string) =>
  `${state.toUpperCase()}:${String(countyFips).padStart(3, "0")}`;

const curatedMap = new Map<string, LinkEntry>();
for (const entry of links) {
  curatedMap.set(key(entry.state, entry.countyFips), entry);
}

const stateFallbackMap = new Map<string, StateFallbackEntry>();
for (const entry of stateFallbacks) {
  stateFallbackMap.set(entry.state.toUpperCase(), entry);
}

/**
 * Returns the property-search URL for the given state and county FIPS.
 * Uses curated county link if present; otherwise state fallback. Returns null only if state has no fallback.
 */
export function getLink(state: string, countyFips: string): string | null {
  const result = getEntry(state, countyFips);
  return result?.url ?? null;
}

/**
 * Returns the full registry result (url, label, source, verified) for display.
 * Tier 1: curated county link. Tier 2: state fallback. Returns null only if state has no fallback.
 */
export function getEntry(state: string, countyFips: string): RegistryResult | null {
  const normalized = key(state, countyFips);
  const curated = curatedMap.get(normalized);
  if (curated) {
    return {
      url: curated.propertySearchUrl,
      label: `${curated.countyName} County property search`,
      source: "curated",
      verified: true,
      countyName: curated.countyName,
      state: curated.state
    };
  }
  const fallback = stateFallbackMap.get(state.toUpperCase());
  if (fallback) {
    return {
      url: fallback.url,
      label: fallback.label,
      source: "state_fallback",
      verified: true,
      state: fallback.state
    };
  }
  return null;
}
