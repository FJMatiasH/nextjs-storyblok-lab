import { expect, test, type Locator, type Page } from "@playwright/test";

// The webServer runs with CONTACT_API_URL empty, so a valid submission is
// logged by the Server Action instead of being sent anywhere.

// The heading, button and success text can be overridden in Storyblok, so
// they are located by structure. Field labels and validation messages are
// owned by the code, so those stay literal.
function contactForm(page: Page) {
  // The form's section is labelled by its heading, so it is a region.
  return page.getByRole("region").filter({ has: page.locator("form") });
}

function submitButton(form: Locator) {
  return form.locator('button[type="submit"]');
}

test.beforeEach(async ({ page }) => {
  await page.goto("/en");
});

test("submitting the empty form shows an error for each field", async ({
  page,
}) => {
  const form = contactForm(page);
  await submitButton(form).click();

  const name = form.getByRole("textbox", { name: /^Name/ });
  await expect(name).toHaveAccessibleDescription("Enter your name.");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await expect(
    form.getByRole("textbox", { name: /^Email/ }),
  ).toHaveAccessibleDescription("Enter your email address.");
  await expect(
    form.getByRole("textbox", { name: /^Message/ }),
  ).toHaveAccessibleDescription("Enter a message.");
  await expect(form.getByRole("status")).toHaveText(
    "3 fields need attention.",
  );
});

test("a valid submission shows the success message", async ({ page }) => {
  const form = contactForm(page);
  await form.getByRole("textbox", { name: /^Name/ }).fill("Ada Lovelace");
  await form.getByRole("textbox", { name: /^Email/ }).fill("ada@example.com");
  await form
    .getByRole("textbox", { name: /^Message/ })
    .fill("Can I invite my whole team?");
  await submitButton(form).click();

  await expect(form.getByRole("status")).not.toBeEmpty();
  await expect(form.getByText("Enter your name.")).toHaveCount(0);
});
