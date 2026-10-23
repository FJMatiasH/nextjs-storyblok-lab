// Shared by the contact Server Action and the ContactForm client component.
// A "use server" module may only export async functions, so the limits and
// types live here.

/** Server-side limits; the inputs use the same values as maxLength. */
export const contactLimits = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

/**
 * Name of the honeypot input. Humans never see it; bots tend to fill it.
 * Non-semantic on purpose: a name like "website" can be autofilled, which
 * would silently drop a real message.
 */
export const honeypotField = "cf_hp";

export type ContactField = keyof typeof contactLimits;

export type ContactFormValues = Record<ContactField, string>;

export type ContactFormErrors = Partial<Record<ContactField | "form", string>>;

// submittedAt changes on every submission so the client can re-announce an
// identical result in its live region.
export type ContactFormState =
  | { ok: true; submittedAt: number }
  | {
      ok: false;
      errors: ContactFormErrors;
      values: ContactFormValues;
      submittedAt: number;
    };
