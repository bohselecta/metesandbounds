import { describe, it, expect } from "vitest";
import { getLink, getEntry } from "./index";

describe("getLink", () => {
  it("returns Travis County property search URL for TX:453", () => {
    expect(getLink("TX", "453")).toBe("https://travis.prodigycad.com/property-search");
  });

  it("returns same URL with padded FIPS", () => {
    expect(getLink("tx", "453")).toBe("https://travis.prodigycad.com/property-search");
  });

  it("returns state fallback URL when county not curated (e.g. CA)", () => {
    const url = getLink("CA", "037");
    expect(url).not.toBeNull();
    expect(url).toContain("boe.ca.gov");
  });

  it("returns null for unknown state code", () => {
    expect(getLink("XX", "000")).toBeNull();
  });
});

describe("getEntry", () => {
  it("returns curated entry with countyName for Travis", () => {
    const entry = getEntry("TX", "453");
    expect(entry).not.toBeNull();
    expect(entry?.source).toBe("curated");
    expect(entry?.countyName).toBe("Travis");
    expect(entry?.url).toContain("travis.prodigycad.com");
    expect(entry?.label).toContain("Travis");
  });

  it("returns state_fallback for county without curated link", () => {
    const entry = getEntry("CA", "037");
    expect(entry).not.toBeNull();
    expect(entry?.source).toBe("state_fallback");
    expect(entry?.url).toContain("boe.ca.gov");
    expect(entry?.verified).toBe(true);
  });

  it("returns null for unknown state code", () => {
    expect(getEntry("XX", "000")).toBeNull();
  });
});
