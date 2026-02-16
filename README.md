# Parcel Link Finder

Takes a US address and returns the official property-search link for that county.

## Setup

```bash
pnpm install
```

## Develop

```bash
pnpm dev
```

Opens the web app at [http://localhost:3000](http://localhost:3000). Enter an address and click **Find link** to get the county’s property search URL (when we have one).

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `pnpm build`   | Build all packages             |
| `pnpm dev`     | Run the web app in dev mode    |
| `pnpm lint`    | Run ESLint                     |
| `pnpm typecheck` | Type-check all packages      |
| `pnpm test`    | Run unit tests (registry + API route with mocked geocode) |
| `pnpm run smoke:live` | Optional: run against a live server (`pnpm dev` in another terminal). Uses `http://localhost:3000` by default; set `SMOKE_BASE` if the app runs on another port (e.g. `SMOKE_BASE=http://localhost:3001`). |

## Adding a county

Edit the link registry in `packages/data/src/links.json`: add an entry with `state`, `countyFips`, `countyName`, and `propertySearchUrl`. Use 3-digit county FIPS (e.g. `453` for Travis County, TX). Redeploy the app if needed.

## Deploy to Cloudflare (GitHub + Workers)

Push this repo to [github.com/bohselecta/metesandbounds](https://github.com/bohselecta/metesandbounds) and connect it in the Cloudflare dashboard for automatic deploys. Full steps (GitHub, build commands, custom domain) are in **[DEPLOY.md](./DEPLOY.md)**.

Quick deploy from your machine:

```bash
pnpm run deploy:cloudflare
```

## How it works

1. You submit an address.
2. The app geocodes it with the [Census Bureau Geocoder](https://geocoding.geo.census.gov/) (no API key).
3. It looks up the county (state + county FIPS) in a static registry.
4. It returns the property-search URL for that county, or a message if we don’t have one yet.
