import { contactLimits } from "@/lib/contact";
import { buildContactSchema, contactMessages } from "@/lib/contact-schema";
import { locales, type Locale } from "@/lib/i18n";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Can I invite my whole team?",
};

/** First error message per field, or {} when the input is valid. */
function errorsFor(
  locale: Locale,
  input: Record<string, string>,
): Record<string, string> {
  const result = buildContactSchema(locale).safeParse(input);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    errors[String(issue.path[0])] ??= issue.message;
  }
  return errors;
}

describe("buildContactSchema", () => {
  it("accepts a valid message", () => {
    expect(errorsFor("en", valid)).toEqual({});
  });

  it("trims surrounding whitespace", () => {
    const result = buildContactSchema("en").parse({
      name: "  Ada Lovelace ",
      email: " ada@example.com\n",
      message: "\tCan I invite my whole team?  ",
    });

    expect(result).toEqual(valid);
  });

  // Literal copy, so a missing or wrong translation fails the test.
  it.each([
    {
      locale: "en",
      name: "Enter your name.",
      email: "Enter your email address.",
      message: "Enter a message.",
    },
    {
      locale: "es",
      name: "Escribe tu nombre.",
      email: "Escribe tu correo electrónico.",
      message: "Escribe un mensaje.",
    },
  ] as const)("requires every field ($locale messages)", ({ locale, ...expected }) => {
    // Whitespace only counts as empty after trimming.
    expect(errorsFor(locale, { name: "", email: "  ", message: "\n" })).toEqual(
      expected,
    );
  });

  it.each([
    { locale: "en", email: "Enter an email address like name@example.com." },
    { locale: "es", email: "Escribe un correo como nombre@ejemplo.com." },
  ] as const)("rejects an invalid email ($locale message)", ({ locale, email }) => {
    expect(errorsFor(locale, { ...valid, email: "ada.example.com" })).toEqual({
      email,
    });
  });

  it("accepts values at the length limits", () => {
    const domain = "@example.com";
    const atLimit = {
      name: "a".repeat(contactLimits.name),
      email: "a".repeat(contactLimits.email - domain.length) + domain,
      message: "a".repeat(contactLimits.message),
    };

    expect(errorsFor("en", atLimit)).toEqual({});
  });

  it.each(locales)("rejects values over the length limits (%s)", (locale) => {
    const t = contactMessages[locale];
    const overLimit = {
      name: "a".repeat(contactLimits.name + 1),
      email: "a".repeat(contactLimits.email) + "@example.com",
      message: "a".repeat(contactLimits.message + 1),
    };

    expect(errorsFor(locale, overLimit)).toEqual({
      name: t.nameTooLong,
      email: t.emailTooLong,
      message: t.messageTooLong,
    });
  });
});
