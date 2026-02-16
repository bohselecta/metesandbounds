import { describe, it, expect } from "vitest";
import { getLink, getEntry } from "./index";

describe("getLink", () => {
  it("returns Travis County property search URL for TX:453", () => {
    expect(getLink("TX", "453")).toBe("https://travis.prodigycad.com/property-search");
  });

  it("returns same URL with padded FIPS", () => {
    expect(getLink("tx", "453")).toBe("https://travis.prodigycad.com/property-search");
  });

  it("returns null for unknown jurisdiction", () => {
    expect(getLink("CA", "037")).toBeNull();
  });
});

describe("getEntry", () => {
  it("returns entry with countyName for Travis", () => {
    const entry = getEntry("TX", "453");
    expect(entry).not.toBeNull();
    expect(entry?.countyName).toBe("Travis");
    expect(entry?.propertySearchUrl).toContain("travis.prodigycad.com");
  });

  it("returns null for unknown jurisdiction", () => {
    expect(getEntry("XX", "000")).toBeNull();
  });
});
