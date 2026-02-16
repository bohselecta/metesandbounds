# Deploy to Cloudflare (GitHub + Workers / Pages)

This app runs on **Cloudflare Workers** using the [OpenNext adapter](https://opennext.js.org/cloudflare). You can push code to GitHub and have Cloudflare build and deploy automatically, or deploy from your machine with the CLI.

## 1. Push the app to GitHub

If you haven’t already, create a repo (e.g. [github.com/bohselecta/metesandbounds](https://github.com/bohselecta/metesandbounds)) and push this folder as the repo root:

```bash
cd /path/to/parcel-link-finder
git init
git add .
git commit -m "Initial commit: Parcel Link Finder"
git remote add origin https://github.com/bohselecta/metesandbounds.git
git branch -M main
git push -u origin main
```

## 2. Deploy from your machine (one-off)

Install dependencies, build for Cloudflare, and deploy:

```bash
pnpm run deploy:cloudflare
```

You’ll be prompted to log in to Cloudflare (browser) if you aren’t already. The app will be deployed to a `*.workers.dev` URL (e.g. `metesandbounds.<your-subdomain>.workers.dev`).

To only build (no deploy):

```bash
pnpm run build:cloudflare
```

To build and preview locally in the Workers runtime:

```bash
cd apps/web && pnpm run preview
```

## 3. Connect GitHub to Cloudflare (auto deploy)

Use **Workers** (recommended for this Next.js app) or **Pages** with a custom build.

### Option A: Cloudflare Workers (recommended)

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages**.
2. Click **Create** → **Create Worker**.
3. Choose **Connect to Git** and select **GitHub**. Authorize Cloudflare and pick the repo `bohselecta/metesandbounds`.
4. **Build configuration:**
   - **Build command:**  
     `pnpm install && pnpm exec turbo run build --filter=@parcel-link/data && cd apps/web && pnpm run build:cloudflare`
   - **Deploy command (or “Build step” then “Deploy”):**  
     `cd apps/web && pnpm exec wrangler deploy`
   - **Root directory:** leave empty (repo root).
5. Save and deploy. Cloudflare will run the build, then deploy the Worker from `apps/web`.

If your dashboard uses a single “Build command” that must do both build and deploy, use:

- **Build command:**  
  `pnpm install && pnpm exec turbo run build --filter=@parcel-link/data && cd apps/web && pnpm run build:cloudflare && pnpm exec wrangler deploy`

### Option B: Cloudflare Pages

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select `bohselecta/metesandbounds`.
2. **Build settings:**
   - **Framework preset:** None.
   - **Build command:**  
     `pnpm install && pnpm exec turbo run build --filter=@parcel-link/data && cd apps/web && pnpm run build:cloudflare`
   - **Build output directory:** leave empty (OpenNext produces a Worker, not a static folder).
3. For **Pages**, the “output directory” model doesn’t fit this stack. Prefer **Workers** (Option A) so the deploy step runs `wrangler deploy` from `apps/web`. If you must use Pages, check Cloudflare’s docs for “Pages with Workers” or use the same build + deploy commands as in Option A in your CI or a custom build step.

## 4. Environment variables

This app doesn’t require env vars for basic use (Census geocoding is public). If you add any later (e.g. in `apps/web/.env`), configure them in Cloudflare:

- **Workers:** Workers & Pages → your project → **Settings** → **Variables and Secrets**.
- **Workers Builds (Git):** In the build configuration, set **Build variables and secrets** so they’re available during `next build` and at runtime if needed.

## 5. Custom domain (optional)

In the Workers & Pages project, go to **Settings** → **Domains & Routes** and add your domain. Cloudflare will show DNS instructions.

## Summary

| Goal                         | Command or step |
|-----------------------------|------------------|
| Push to GitHub              | `git push` to `bohselecta/metesandbounds` |
| Deploy from CLI             | `pnpm run deploy:cloudflare` |
| Build only (Cloudflare)     | `pnpm run build:cloudflare` |
| Preview locally (Workers)    | `cd apps/web && pnpm run preview` |
| Auto deploy on push         | Connect repo in Workers & Pages and set build/deploy commands above |
