export type LinkEntry = {
  state: string;
  countyFips: string;
  countyName: string;
  propertySearchUrl: string;
};

import linksJson from "./links.json" with { type: "json" };

const links = linksJson as LinkEntry[];

const key = (state: string, countyFips: string) =>
  `${state.toUpperCase()}:${String(countyFips).padStart(3, "0")}`;

const map = new Map<string, LinkEntry>();
for (const entry of links) {
  map.set(key(entry.state, entry.countyFips), entry);
}

/**
 * Returns the property-search URL for the given state and county FIPS, or null if not in registry.
 */
export function getLink(state: string, countyFips: string): string | null {
  const normalized = key(state, countyFips);
  const entry = map.get(normalized);
  return entry?.propertySearchUrl ?? null;
}

/**
 * Returns the full entry (url + countyName) for display, or null.
 */
export function getEntry(state: string, countyFips: string): LinkEntry | null {
  const normalized = key(state, countyFips);
  return map.get(normalized) ?? null;
}
