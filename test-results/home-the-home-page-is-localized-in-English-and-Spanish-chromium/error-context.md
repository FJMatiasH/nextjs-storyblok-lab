# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> the home page is localized in English and Spanish
- Location: e2e\home.spec.ts:18:5

# Error details

```
Error: <title> should differ between /en and /es

expect(received).not.toBe(expected) // Object.is equality

Expected: not "Home | Northlight"
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - link "Saltar al contenido principal" [ref=f1e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f1e3]:
    - link "Northlight" [ref=f1e4] [cursor=pointer]:
      - /url: /es
    - navigation "Idioma" [ref=f1e5]:
      - list [ref=f1e6]:
        - listitem [ref=f1e7]:
          - link "English" [ref=f1e8] [cursor=pointer]:
            - /url: /en
        - listitem [ref=f1e9]:
          - link "Español" [ref=f1e10] [cursor=pointer]:
            - /url: /es
  - main [ref=f1e11]:
    - generic [ref=f1e13]:
      - heading "Cargadores que funcionan" [level=1] [ref=f1e16]
      - list [ref=f1e18]:
        - listitem [ref=f1e19]:
          - heading "Contactanos" [level=2] [ref=f1e21]
        - listitem [ref=f1e22]:
          - paragraph [ref=f1e23]: Monitoreo en tiempo real
        - listitem [ref=f1e24]:
          - paragraph [ref=f1e25]: Facturación automatizada
        - listitem [ref=f1e26]:
          - paragraph [ref=f1e27]: Itinerancia por Europa
        - listitem [ref=f1e28]:
          - region [ref=f1e29]:
            - heading "Contáctanos" [level=2] [ref=f1e30]
            - generic [ref=f1e31]:
              - generic [ref=f1e32]:
                - generic [ref=f1e33]: Nombre (obligatorio)
                - textbox "Nombre (obligatorio)" [ref=f1e34]
              - generic [ref=f1e35]:
                - generic [ref=f1e36]: Correo electrónico (obligatorio)
                - textbox "Correo electrónico (obligatorio)" [ref=f1e37]
              - generic [ref=f1e38]:
                - generic [ref=f1e39]: Mensaje (obligatorio)
                - textbox "Mensaje (obligatorio)" [ref=f1e40]
              - generic [aria-hidden] [ref=f1e41]:
                - text: Deja este campo vacío
                - textbox [ref=f1e42]
              - button "Enviar mensaje" [ref=f1e43] [cursor=pointer]
            - status
  - contentinfo [ref=f1e44]:
    - paragraph [ref=f1e45]: Northlight. Herramientas modernas para equipos pequeños.
  - alert [ref=f1e46]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | async function readHome(page: Page, locale: "en" | "es") {
  4  |   await page.goto(`/${locale}`);
  5  |   await expect(page.locator("html")).toHaveAttribute("lang", locale);
  6  | 
  7  |   const title = (await page.title()).trim();
  8  |   const h1 = page.getByRole("heading", { level: 1 });
  9  |   // Exactly one page heading per page.
  10 |   await expect(h1).toHaveCount(1);
  11 |   const heading = (await h1.innerText()).trim();
  12 | 
  13 |   expect(title, `<title> on /${locale}`).not.toBe("");
  14 |   expect(heading, `h1 on /${locale}`).not.toBe("");
  15 |   return { title, heading };
  16 | }
  17 | 
  18 | test("the home page is localized in English and Spanish", async ({ page }) => {
  19 |   const en = await readHome(page, "en");
  20 |   const es = await readHome(page, "es");
  21 | 
  22 |   // Content comes from Storyblok, so compare the locales instead of
  23 |   // hard-coding copy that editors can change.
  24 |   expect(es.heading, "h1 should differ between /en and /es").not.toBe(
  25 |     en.heading,
  26 |   );
> 27 |   expect(es.title, "<title> should differ between /en and /es").not.toBe(
     |                                                                     ^ Error: <title> should differ between /en and /es
  28 |     en.title,
  29 |   );
  30 | });
  31 | 
  32 | test("the language switcher goes from English to Spanish", async ({ page }) => {
  33 |   await page.goto("/en");
  34 | 
  35 |   const languages = page.getByRole("navigation", { name: "Language" });
  36 |   await expect(
  37 |     languages.getByRole("link", { name: "English" }),
  38 |   ).toHaveAttribute("aria-current", "true");
  39 | 
  40 |   await languages.getByRole("link", { name: "Español" }).click();
  41 | 
  42 |   await expect(page).toHaveURL(/\/es$/);
  43 |   await expect(page.locator("html")).toHaveAttribute("lang", "es");
  44 |   await expect(
  45 |     page
  46 |       .getByRole("navigation", { name: "Idioma" })
  47 |       .getByRole("link", { name: "Español" }),
  48 |   ).toHaveAttribute("aria-current", "true");
  49 | });
  50 | 
```