"use server";

import { z } from "zod";
import {
  contactLimits,
  honeypotField,
  type ContactFormState,
  type ContactFormValues,
} from "@/lib/contact";
import { buildContactSchema, contactMessages } from "@/lib/contact-schema";
import { defaultLocale, isLocale } from "@/lib/i18n";

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

  const result = buildContactSchema(locale).safeParse({
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
      errors: { form: contactMessages[locale].sendFailed },
      values,
      submittedAt: Date.now(),
    };
  }

  return { ok: true, submittedAt: Date.now() };
}
