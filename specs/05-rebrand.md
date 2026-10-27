# Rebrand spec

## Decisions (change only these values)
- Brand name: Northlight
- Tagline EN: Modern tools for small teams.
- Tagline ES: Herramientas modernas para equipos pequeños.
- Repository and package name: nextjs-storyblok-lab
- Product: a fictional workflow platform for small teams (generic, not tied to any industry).

## Goal
Remove every reference to the previous company name and to the EV-charging theme. The project becomes a generic, bilingual (en, es) marketing demo site built with Next.js and Storyblok. Change names and copy only. Do not change behaviour, structure, routes, props, CSS or dependencies.

## What to change
- package.json "name" and the matching name fields in package-lock.json.
- README.md, CLAUDE.md, AGENTS.md (only mentions of the project name), specs/*, docs/*, and code comments.
- UI strings in code: header brand name, footer text, fallback or default texts, aria-labels, default page title and description, Open Graph site name, JSON-LD Organization (name, description), and any manifest or alt text.
- Tests (Jest and Playwright): update assertions that contain the old brand or old copy. Prefer assertions that do not depend on exact marketing copy, such as "an h1 exists" and "the h1 differs between en and es".
- Files in public/ that contain the old name (for example an SVG logo): replace with a simple text logo or remove, and tell me.

## Vocabulary
Replace the EV theme with neutral wording: charging network becomes workspace, charge points become projects, drivers or "Charging Heroes" become teams, "operate and bill" becomes "plan, run and track". Keep the tone short and neutral.

## Default copy for code fallbacks
- Footer EN: Northlight. Modern tools for small teams.
- Footer ES: Northlight. Herramientas modernas para equipos pequeños.
- Default meta title: Northlight
- Default meta description EN: A bilingual demo site built with Next.js and Storyblok.
- Default meta description ES: Un sitio de demostración bilingüe creado con Next.js y Storyblok.

## Out of scope
Renaming the GitHub repository, the local folder or the Git remote. Storyblok content. Dependencies.