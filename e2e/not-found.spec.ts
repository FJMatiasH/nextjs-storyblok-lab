import { expect, test } from "@playwright/test";

// A missing story and an unknown locale must answer with a real 404 status,
// not a 200 page that only says "not found" (a soft 404 for crawlers).
for (const path of ["/en/this-page-does-not-exist", "/fr"]) {
  test(`${path} returns 404 with a link home`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Go to the home page" }),
    ).toHaveAttribute("href", "/en");
  });
}
