import { expect, test, type Page } from "@playwright/test";

async function readHome(page: Page, locale: "en" | "es") {
  await page.goto(`/${locale}`);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);

  const title = (await page.title()).trim();
  const h1 = page.getByRole("heading", { level: 1 });
  // Exactly one page heading per page.
  await expect(h1).toHaveCount(1);
  const heading = (await h1.innerText()).trim();

  expect(title, `<title> on /${locale}`).not.toBe("");
  expect(heading, `h1 on /${locale}`).not.toBe("");
  return { title, heading };
}

test("the home page is localized in English and Spanish", async ({ page }) => {
  const en = await readHome(page, "en");
  const es = await readHome(page, "es");

  // Content comes from Storyblok, so compare the locales instead of
  // hard-coding copy that editors can change.
  expect(es.heading, "h1 should differ between /en and /es").not.toBe(
    en.heading,
  );
  expect(es.title, "<title> should differ between /en and /es").not.toBe(
    en.title,
  );
});

test("the language switcher goes from English to Spanish", async ({ page }) => {
  await page.goto("/en");

  const languages = page.getByRole("navigation", { name: "Language" });
  await expect(
    languages.getByRole("link", { name: "English" }),
  ).toHaveAttribute("aria-current", "true");

  await languages.getByRole("link", { name: "Español" }).click();

  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(
    page
      .getByRole("navigation", { name: "Idioma" })
      .getByRole("link", { name: "Español" }),
  ).toHaveAttribute("aria-current", "true");
});
