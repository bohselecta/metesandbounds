"use client";

import { useState } from "react";

type Result = {
  url: string | null;
  normalizedAddress: string;
  countyName?: string;
  state?: string;
  error?: string;
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/link?address=${encodeURIComponent(address.trim())}`
      );
      const data = (await res.json()) as Result;
      setResult(data);
    } catch {
      setResult({
        url: null,
        normalizedAddress: "",
        error: "Request failed."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Parcel Link Finder</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Enter a US address to get the official property-search link for that county.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="308 Chippendale Ave, Austin, TX 78745"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 6,
            marginBottom: 12
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Finding…" : "Find link"}
        </button>
      </form>

      {result && (
        <div
          style={{
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafafa"
          }}
        >
          {result.error && (
            <p style={{ margin: 0, color: "#c00" }}>{result.error}</p>
          )}
          {result.normalizedAddress && (
            <p style={{ margin: "8px 0 0", color: "#666", fontSize: 14 }}>
              Normalized: {result.normalizedAddress}
              {result.countyName != null && result.state != null && (
                <> · {result.countyName} County, {result.state}</>
              )}
            </p>
          )}
          {result.url && (
            <p style={{ margin: "12px 0 0" }}>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 16 }}
              >
                {result.countyName != null
                  ? `${result.countyName} County property search`
                  : "Property search"}
              </a>
            </p>
          )}
        </div>
      )}
    </main>
  );
}
