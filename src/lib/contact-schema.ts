// Validation for the contact form. Lives outside the "use server" action
// (which may only export async functions) so it can be unit-tested.
import { z } from "zod";
import { contactLimits } from "@/lib/contact";
import type { Locale } from "@/lib/i18n";

export const contactMessages = {
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

export function buildContactSchema(locale: Locale) {
  const t = contactMessages[locale];

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
