# nextjs-storyblok-lab

Marketing site for **Northlight**, a fictional workflow platform for small
teams. It is a bilingual (English and Spanish) demo built with Next.js (App
Router), React, TypeScript and Storyblok as the headless CMS.

The specs in [`specs/`](specs/) are the source of truth for behaviour.

## Getting started

Requirements: Node.js 20.9 or later and access to the Storyblok space.

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000 (redirects to /en)
```

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `STORYBLOK_TOKEN` | yes | Public token; reads published content. |
| `STORYBLOK_PREVIEW_TOKEN` | no | Preview token; reads draft content. Never cached. |
| `NEXT_PUBLIC_SITE_URL` | in production | Absolute site URL for canonical links, hreflang, the sitemap and robots.txt. The production build fails without it. |
| `REVALIDATE_SECRET` | for the webhook | Shared secret for `POST /api/revalidate` (see below). |
| `CONTACT_API_URL` | no | Endpoint that receives contact form submissions as JSON. When empty, submissions are only logged on the server. |

Never commit `.env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server. |
| `npm run build` | Production build. |
| `npm run start` | Serves the production build. |
| `npm run lint` | ESLint. |
| `npm test` | Jest and React Testing Library unit and component tests. |
| `npm run test:e2e` | Playwright end-to-end tests with an axe accessibility check. Builds and starts the site on port 3100 and reads live Storyblok content through `.env.local`. Run `npx playwright install chromium` once first. |

CI (`.github/workflows/ci.yml`) runs lint, unit tests, the build and the
E2E tests on every pull request and on pushes to `main`. It needs the
`STORYBLOK_TOKEN`, `STORYBLOK_PREVIEW_TOKEN` and `REVALIDATE_SECRET` repository
secrets, and optionally the `NEXT_PUBLIC_SITE_URL` variable.

## How it works

- **Routes.** `src/app/[locale]/[[...slug]]/page.tsx` serves every page. `/en`
  and `/es` load the Storyblok stories `en/home` and `es/home`; `/en/about`
  loads `en/about`. `/` redirects to `/en`, and `/en/home` redirects to `/en`.
  An unknown locale or story returns a real 404.
- **Blocks.** Each Storyblok block maps to a component in
  `src/components/blocks/`, registered in `src/lib/storyblok.ts`:
  `page`, `hero`, `feature_grid`, `feature`, `cta_banner` and
  `contact_form`. Unknown blocks render nothing in production and a warning in
  development. See [`specs/02-content-model.md`](specs/02-content-model.md).
- **SEO.** `src/lib/seo.ts` builds the metadata from the story's `seo_title`,
  `seo_description` and `og_image` fields, with hreflang for both locales.
  The home page adds Organization JSON-LD. `src/app/sitemap.ts` and
  `src/app/robots.ts` cover the rest.
- **Contact form.** A client component posts to a Server Action
  (`src/app/actions/contact.ts`) that validates with zod, drops honeypot
  spam and forwards to `CONTACT_API_URL`. It also works without JavaScript.
- **Styles.** Plain CSS in `src/app/globals.css` with design tokens in
  `src/styles/tokens.css`. The tokens file lists the contrast ratio of every
  colour pair in use.

## Caching and the Storyblok webhook

Published Storyblok content is cached with Next.js Cache Components
(`"use cache"` in `src/lib/storyblok.ts`):

- Each story is cached for 1 hour (`cacheLife({ revalidate: 3600 })`) and
  tagged `story:<full_slug>`, for example `story:en/home`.
- The links list (sitemap and hreflang) is cached the same way and tagged
  `storyblok:links`.
- Draft content (`STORYBLOK_PREVIEW_TOKEN`) is never cached.

To update the site as soon as an editor publishes, Storyblok calls
`POST /api/revalidate`. The route checks the secret, then revalidates the
story's tag, the links tag and the story's path (`en/home` → `/en`,
`en/about` → `/en/about`).

### Configure the webhook

1. Set `REVALIDATE_SECRET` in the deployment's environment variables (and in
   `.env.local` for local testing). Use a long random value, for example the
   output of `openssl rand -hex 32`.
2. In Storyblok, open **Settings → Webhooks** and click **New webhook**.
3. Set the **Endpoint URL** to:

   ```text
   https://<your-site>/api/revalidate?secret=<REVALIDATE_SECRET>
   ```

4. Under **Triggers**, select the story events **Story published**,
   **Story unpublished**, **Story deleted** and **Story moved**.
5. Save. Publish a story and check the webhook log in Storyblok: a successful
   call returns `200` with `{"revalidated":true,...}`.

The route expects Storyblok's story webhook body, which includes the story's
`full_slug`:

```json
{ "text": "...", "action": "published", "space_id": 123, "story_id": 456, "full_slug": "en/about" }
```

Responses:

| Status | Meaning |
| --- | --- |
| 200 | Tag and path revalidated. |
| 400 | Body is not JSON or has no valid `full_slug`. |
| 401 | `secret` is missing or wrong. |
| 500 | `REVALIDATE_SECRET` is not set on the server. |

Test it locally against `npm run build && npm run start`:

```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=$REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"action":"published","full_slug":"en/home"}'
```

Notes:

- Revalidation uses `revalidateTag(tag, "max")`: the first visit after a
  publish may still see the old version while the new one is fetched in the
  background. The story's own path is refreshed on the next visit.
- When a story is **moved**, the webhook only sends the new slug. The old URL
  stays cached until its hour expires.
- The secret travels in the URL, so it can appear in access logs. Rotate it if
  it leaks.

## Deployment

Any host that runs a Node.js Next.js server works (for example Vercel). Set
the environment variables above in the host, then configure the Storyblok
webhook so published changes appear without a redeploy.
