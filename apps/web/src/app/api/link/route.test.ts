import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

const TRAVIS_GEOCODE_RESPONSE = {
  result: {
    addressMatches: [
      {
        matchedAddress: "308 CHIPPENDALE AVE, AUSTIN, TX, 78745",
        coordinates: { x: -97.75, y: 30.2 },
        addressComponents: { state: "TX", county: "453", countyName: "Travis" }
      }
    ]
  }
};

describe("GET /api/link", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(TRAVIS_GEOCODE_RESPONSE)
        })
      )
    );
  });

  it("returns Travis County property search URL for Austin address", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/link?address=308+Chippendale+Ave,+Austin,+TX+78745"
    );
    const res = await GET(req);
    const data = await res.json();
    expect(data.url).toBe("https://travis.prodigycad.com/property-search");
    expect(data.normalizedAddress).toContain("CHIPPENDALE");
    expect(data.countyName).toBe("Travis");
    expect(data.state).toBe("TX");
  });

  it("returns error when address is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/link");
    const res = await GET(req);
    const data = await res.json();
    expect(data.url).toBeNull();
    expect(data.error).toBe("Missing address");
  });
});
