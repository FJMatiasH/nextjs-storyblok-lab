# nextjs-storyblok-lab
Marketing website of Northlight, a fictional workflow platform for small
teams. Practice project that
mirrors a real stack: Next.js (App Router) + React + TypeScript, Storyblok as
headless CMS, two locales (en, es).
## Commands
- npm run dev: start the dev server
- npm run build: production build
- npm run lint: ESLint
- `npm test` is not available until the testing task is complete.
- npm run test:e2e: Playwright end-to-end tests
## Stack and rules
- Next.js App Router. Server Components by default; add "use client" only for
interactive parts.
- TypeScript strict. No "any" without a comment explaining why.
- Plain CSS with design tokens in src/styles/tokens.css. No Tailwind, no CSSin-JS.
- Mobile-first and accessible (WCAG 2.2 AA): semantic HTML, visible focus,
labels, alt text, contrast 4.5:1.
- Storyblok SDK: import from "@storyblok/react/rsc". Every block component is
registered in src/lib/storyblok.ts and uses storyblokEditable.
- Never hard-code secrets. Read them from environment variables (see
.env.example). Never commit .env.local.
- Locales: en (default) and es. Content paths in Storyblok are en/home and
es/home.
## Specs
Read the files in specs/ before coding. They are the source of truth. If code
and spec disagree, ask me before changing either.
## Workflow
- One git branch per task (feat/..., fix/...). Small commits with clear
messages.
- Until the testing task is complete, run only `npm run lint` and
  `npm run build`.
- After UI changes use the a11y-reviewer subagent. After SEO changes use seo-reviewer. Before a pull request use code-reviewer.
- Explain what you changed and why in 3 to 5 lines. List anything you were
unsure about.
- Do not add dependencies without telling me why.
