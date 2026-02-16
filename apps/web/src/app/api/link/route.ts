import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { getEntry } from "@parcel-link/data";

export type LinkResponse = {
  url: string | null;
  normalizedAddress: string;
  countyName?: string;
  state?: string;
  error?: string;
};

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || !address.trim()) {
    return NextResponse.json(
      { url: null, normalizedAddress: "", error: "Missing address" } satisfies LinkResponse,
      { status: 200 }
    );
  }

  try {
    const geo = await geocodeAddress(address.trim());
    const entry = getEntry(geo.state, geo.countyFips);

    if (!entry) {
      return NextResponse.json({
        url: null,
        normalizedAddress: geo.normalizedAddress,
        countyName: geo.countyName,
        state: geo.state,
        error: "No link for this county yet"
      } satisfies LinkResponse);
    }

    return NextResponse.json({
      url: entry.propertySearchUrl,
      normalizedAddress: geo.normalizedAddress,
      countyName: entry.countyName,
      state: entry.state
    } satisfies LinkResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "No geocode match") {
      return NextResponse.json({
        url: null,
        normalizedAddress: "",
        error: "No geocode match"
      } satisfies LinkResponse);
    }
    return NextResponse.json({
      url: null,
      normalizedAddress: "",
      error: message
    } satisfies LinkResponse);
  }
}
