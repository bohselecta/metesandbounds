export type CensusGeocode = {
  normalizedAddress: string;
  lat: number;
  lng: number;
  state: string;
  countyFips: string;
  countyName?: string;
};

export function normalizeAddress(address: string): string {
  return address.replace(/\s+/g, " ").trim();
}

export async function geocodeAddress(address: string): Promise<CensusGeocode> {
  const normalized = normalizeAddress(address);
  const url = new URL(
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
  );
  url.searchParams.set("address", normalized);
  url.searchParams.set("benchmark", "2020");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Census geocoder failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    result?: { addressMatches?: Array<{
      matchedAddress?: string;
      coordinates?: { x: number; y: number };
      addressComponents?: { state?: string; county?: string; countyName?: string };
    }> };
  };
  const match = json?.result?.addressMatches?.[0];
  if (!match) {
    throw new Error("No geocode match");
  }

  const coords = match.coordinates ?? { x: 0, y: 0 };
  const components = match.addressComponents ?? {};
  const state = String(components.state ?? "").toUpperCase();
  let countyFips = String(components.county ?? "").trim().padStart(3, "0");
  // Census may return 5-digit GEOID (state FIPS + county FIPS); use last 3 for county
  if (countyFips.length === 5) {
    countyFips = countyFips.substring(2);
  }
  let countyName = components.countyName ? String(components.countyName) : undefined;

  if (!countyFips || countyFips === "000" || countyFips.length !== 3) {
    const geoRes = await fetch(
      `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${coords.x}&y=${coords.y}&benchmark=2020&vintage=2020&format=json`
    );
    if (geoRes.ok) {
      const geoJson = (await geoRes.json()) as {
        result?: { geographies?: { Counties?: Array<{ GEOID?: string; NAME?: string }> } };
      };
      const countyGeo = geoJson?.result?.geographies?.Counties?.[0];
      if (countyGeo?.GEOID) {
        const geoidStr = String(countyGeo.GEOID).padStart(5, "0");
        countyFips = geoidStr.substring(2);
        countyName = countyGeo.NAME;
      }
    }
  }

  if (!state || state.length !== 2 || !countyFips || countyFips.length !== 3) {
    throw new Error("Missing state/county FIPS in geocoder response");
  }

  return {
    normalizedAddress: String(match.matchedAddress ?? address),
    lat: Number(coords.y),
    lng: Number(coords.x),
    state,
    countyFips,
    countyName
  };
}
