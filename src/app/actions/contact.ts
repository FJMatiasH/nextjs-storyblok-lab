"use server";

import { z } from "zod";
import {
  contactLimits,
  honeypotField,
  type ContactFormState,
  type ContactFormValues,
} from "@/lib/contact";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

const messages = {
  en: {
    nameRequired: "Enter your name.",
    nameTooLong: `Use ${contactLimits.name} characters or fewer for your name.`,
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter an email address like name@example.com.",
    emailTooLong: `Use ${contactLimits.email} characters or fewer for your email.`,
    messageRequired: "Enter a message.",
    messageTooLong: `Use ${contactLimits.message} characters or fewer for your message.`,
    sendFailed:
      "Your message could not be sent. Please try again in a few minutes.",
  },
  es: {
    nameRequired: "Escribe tu nombre.",
    nameTooLong: `Usa ${contactLimits.name} caracteres o menos para tu nombre.`,
    emailRequired: "Escribe tu correo electrónico.",
    emailInvalid: "Escribe un correo como nombre@ejemplo.com.",
    emailTooLong: `Usa ${contactLimits.email} caracteres o menos para tu correo.`,
    messageRequired: "Escribe un mensaje.",
    messageTooLong: `Usa ${contactLimits.message} caracteres o menos para tu mensaje.`,
    sendFailed:
      "No se pudo enviar tu mensaje. Inténtalo de nuevo en unos minutos.",
  },
} satisfies Record<Locale, Record<string, string>>;

function buildSchema(locale: Locale) {
  const t = messages[locale];

  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t.nameRequired)
      .max(contactLimits.name, t.nameTooLong),
    // Trim and check length first; pipe() only runs z.email() on a clean value.
    email: z
      .string()
      .trim()
      .min(1, t.emailRequired)
      .max(contactLimits.email, t.emailTooLong)
      .pipe(z.email(t.emailInvalid)),
    message: z
      .string()
      .trim()
      .min(1, t.messageRequired)
      .max(contactLimits.message, t.messageTooLong),
  });
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Sends the validated message to CONTACT_API_URL (server only, never public). */
async function deliver(data: ContactFormValues): Promise<boolean> {
  const endpoint = process.env.CONTACT_API_URL?.trim();

  if (!endpoint) {
    // No backend configured (local development): log instead of sending.
    console.log("[contact] CONTACT_API_URL is not set; message:", data);
    return true;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[contact] Contact API responded with HTTP ${response.status}`);
      return false;
    }

    return true;
  } catch (error: unknown) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? "timed out after 5s"
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(`[contact] Contact API request failed: ${reason}`);
    return false;
  }
}

export async function submitContact(
  _prevState: ContactFormState | null,
  formData: FormData,
): Promise<ContactFormState> {
  const rawLocale = readText(formData, "locale");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  // Echoed back so a no-JS submission re-renders with the user's input.
  // Capped so an oversized POST is not reflected in full.
  const values: ContactFormValues = {
    name: readText(formData, "name").slice(0, contactLimits.name),
    email: readText(formData, "email").slice(0, contactLimits.email),
    message: readText(formData, "message").slice(0, contactLimits.message),
  };

  // Honeypot filled: report success without sending, so a bot learns
  // nothing it could use to adapt.
  if (readText(formData, honeypotField).trim() !== "") {
    console.warn("[contact] Submission dropped by spam filter.");
    return { ok: true, submittedAt: Date.now() };
  }

  const result = buildSchema(locale).safeParse({
    name: readText(formData, "name"),
    email: readText(formData, "email"),
    message: readText(formData, "message"),
  });

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;

    return {
      ok: false,
      errors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
      },
      values,
      submittedAt: Date.now(),
    };
  }

  if (!(await deliver(result.data))) {
    return {
      ok: false,
      errors: { form: messages[locale].sendFailed },
      values,
      submittedAt: Date.now(),
    };
  }

  return { ok: true, submittedAt: Date.now() };
}
