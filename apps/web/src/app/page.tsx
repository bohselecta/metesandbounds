"use client";

import { useEffect, useRef, useState } from "react";

type Result = {
  url: string | null;
  normalizedAddress: string;
  countyName?: string;
  state?: string;
  source?: "curated" | "state_fallback";
  label?: string;
  error?: string;
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  function truncateMiddle(value: string, max = 64): string {
    if (value.length <= max) return value;
    const keep = Math.floor((max - 1) / 2);
    return `${value.slice(0, keep)}…${value.slice(value.length - keep)}`;
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast(success);
    } catch {
      setToast("Copy failed");
    }
  }

  function friendlyError(message: string): string {
    if (message === "No geocode match") {
      return "Couldn't resolve this address. Try adding city/state or ZIP.";
    }
    return message;
  }

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
      if (data.url) {
        inputRef.current?.blur();
        setToast("Link ready");
      }
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
    <main className="plf-page">
      <div className="plf-container">
        <header className="plf-header">
          <div className="plf-brandRow">
            <div className="plf-brandMarkShell" aria-hidden="true">
              <img
                src="/ezmb-logo-mark.svg"
                alt=""
                className="plf-brandMark"
              />
            </div>
            <h1 className="plf-title">Parcel Link Finder</h1>
          </div>
          <p className="plf-subtitle">
            Enter any US address to open the official parcel search for the
            correct county.
          </p>
        </header>

        <section className="plf-formBlock">
          <form onSubmit={handleSubmit}>
            <div className="plf-inputRow">
              <div className="plf-fieldWrap">
                <span className="plf-fieldIcon" aria-hidden="true">
                  <PinIcon />
                </span>
                <input
                  ref={inputRef}
                  className="plf-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, city, state, ZIP"
                />
              </div>
              <div className="plf-submitRow">
                <button type="submit" className="plf-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="plf-spinner" aria-hidden="true" />
                      Searching…
                    </>
                  ) : (
                    <>
                      Find link
                      <span className="plf-buttonIcon" aria-hidden="true">
                        <ArrowRightIcon />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section aria-live="polite">
          {loading ? (
            <div className="plf-loadingCard">
              <div className="plf-skeleton plf-s1" />
              <div className="plf-skeleton plf-s2" />
              <div className="plf-skeleton plf-s3" />
            </div>
          ) : result ? (
            <div className="plf-resultsCard">
              {result.error ? (
                <p className="plf-warning">{friendlyError(result.error)}</p>
              ) : null}

              {result.normalizedAddress ? (
                <>
                  <p className="plf-metaLabel">Normalized Address</p>
                  <p className="plf-value">{result.normalizedAddress}</p>
                </>
              ) : null}

              {result.countyName || result.state ? (
                <div className="plf-chipRow">
                  <span className="plf-chip">
                    County / Jurisdiction:{" "}
                    {[result.countyName, result.state].filter(Boolean).join(
                      ", "
                    )}
                  </span>
                </div>
              ) : null}

              {result.url ? (
                <div className="plf-linkWrap">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plf-linkRow"
                  >
                    <ExternalLinkIcon />
                    <span className="plf-linkMeta">
                      <span className="plf-linkMain">
                        {result.label ?? "Property search"}
                      </span>
                      <span className="plf-linkAux">
                        {truncateMiddle(result.url)}
                      </span>
                    </span>
                    <span className="plf-chevron" aria-hidden="true">
                      <ChevronRightIcon />
                    </span>
                  </a>

                  {result.source === "state_fallback" ? (
                    <p className="plf-note">
                      No county-specific link yet; use the state portal to find
                      your county.
                    </p>
                  ) : null}

                  <div className="plf-actions">
                    <button
                      type="button"
                      className="plf-quietBtn"
                      onClick={() =>
                        copyText(
                          result.normalizedAddress,
                          "Copied normalized address"
                        )
                      }
                    >
                      Copy normalized address
                    </button>
                    <button
                      type="button"
                      className="plf-quietBtn"
                      onClick={() => copyText(result.url ?? "", "Copied link")}
                    >
                      Copy link
                    </button>
                  </div>
                  <p className="plf-disclaimer">
                    Public sources only. Verify with the county.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="plf-emptyCard">
              <p className="plf-emptyTitle">
                Try a full street address like:
              </p>
              <ul className="plf-examples">
                <li>123 Main St, Austin, TX 78703</li>
                <li>4101 Lankershim Blvd, North Hollywood, CA 91602</li>
                <li>120 N LaSalle St, Chicago, IL 60602</li>
              </ul>
              <p className="plf-disclaimer">
                Public sources only. Verify with the county.
              </p>
            </div>
          )}
        </section>
      </div>

      {toast ? <div className="plf-toast">{toast}</div> : null}
    </main>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.44-6.5-10A6.5 6.5 0 0 1 18.5 11c0 4.56-6.5 10-6.5 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="11" r="2.2" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 5h5v5M19 5l-8 8M10 7H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
