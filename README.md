This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
