"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  type FormEvent,
} from "react";
import { useParams, usePathname } from "next/navigation";
import { storyblokEditable } from "@storyblok/react/rsc";
import { submitContact } from "@/app/actions/contact";
import {
  contactLimits,
  honeypotField,
  type ContactField,
  type ContactFormState,
} from "@/lib/contact";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

type ContactFormBlock = {
  _uid: string;
  _editable?: string;
  title?: string;
  submit_label?: string;
  success_message?: string;
  error_message?: string;
};

const copy = {
  en: {
    title: "Contact us",
    submit: "Send message",
    pending: "Sending…",
    success: "Thank you. Your message has been sent.",
    required: "(required)",
    invalidFields: (count: number) =>
      count === 1
        ? "1 field needs attention."
        : `${count} fields need attention.`,
    honeypot: "Leave this field empty",
    labels: { name: "Name", email: "Email", message: "Message" },
  },
  es: {
    title: "Contáctanos",
    submit: "Enviar mensaje",
    pending: "Enviando…",
    success: "Gracias. Tu mensaje se ha enviado.",
    required: "(obligatorio)",
    invalidFields: (count: number) =>
      count === 1
        ? "Hay 1 campo que revisar."
        : `Hay ${count} campos que revisar.`,
    honeypot: "Deja este campo vacío",
    labels: { name: "Nombre", email: "Correo electrónico", message: "Mensaje" },
  },
} satisfies Record<Locale, unknown>;

const fields = ["name", "email", "message"] as const satisfies ContactField[];

function text(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export default function ContactForm({
  blok,
  hasSectionTitle = false,
}: {
  blok: ContactFormBlock;
  // Set by FeatureGrid when an editor places the form among its features.
  hasSectionTitle?: boolean;
}) {
  const params = useParams<{ locale?: string }>();
  const locale =
    params.locale && isLocale(params.locale) ? params.locale : defaultLocale;
  const t = copy[locale];

  // Without JS the page reloads after the POST; the fragment scrolls back to
  // the form so the result is not left below the fold.
  const anchorId = `contact-${blok._uid}`;
  const permalink = `${usePathname()}#${anchorId}`;

  const [state, formAction, isPending] = useActionState<
    ContactFormState | null,
    FormData
  >(submitContact, null, permalink);

  const id = useId();
  const titleId = `${id}-title`;
  const fieldRefs = useRef<
    Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement>>
  >({});
  const Heading = hasSectionTitle ? "h3" : "h2";

  const errors = state?.ok === false ? state.errors : {};
  const values = state?.ok === false ? state.values : undefined;
  const invalidCount = fields.filter((field) => errors[field]).length;

  // After each submission, focus the first invalid field; the live region
  // also announces how many fields need attention, in case focus does not
  // move (the first invalid field already had it). Success and send failures
  // are announced by the live region only (focusing them too would read
  // them twice).
  useEffect(() => {
    if (!state || state.ok) return;

    const firstInvalid = fields.find((field) => state.errors[field]);
    if (firstInvalid) fieldRefs.current[firstInvalid]?.focus();
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // The button stays focusable while pending (aria-disabled), so block
    // a second submission here instead.
    if (isPending) event.preventDefault();
  }

  return (
    <section
      id={anchorId}
      className="contact-form"
      aria-labelledby={titleId}
      {...storyblokEditable(blok)}
    >
      <Heading id={titleId}>{text(blok.title, t.title)}</Heading>

      {/* noValidate: the server's localised, linked messages replace the
          browser's bubbles, which are not tied to the fields for AT. */}
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="contact-form__form"
        noValidate
      >
        <input type="hidden" name="locale" value={locale} />

        {fields.map((field) => {
          const fieldId = `${id}-${field}`;
          const errorId = `${fieldId}-error`;
          const error = errors[field];
          const shared = {
            id: fieldId,
            name: field,
            required: true,
            maxLength: contactLimits[field],
            // "name" and "email" are also the matching autocomplete tokens.
            autoComplete: field === "message" ? undefined : field,
            defaultValue: values?.[field],
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? errorId : undefined,
          };

          return (
            <div className="contact-form__field" key={field}>
              <label htmlFor={fieldId}>
                {t.labels[field]}{" "}
                <span className="contact-form__required">{t.required}</span>
              </label>
              {field === "message" ? (
                <textarea
                  {...shared}
                  rows={6}
                  ref={(node) => {
                    fieldRefs.current[field] = node ?? undefined;
                  }}
                />
              ) : (
                <input
                  {...shared}
                  type={field === "email" ? "email" : "text"}
                  ref={(node) => {
                    fieldRefs.current[field] = node ?? undefined;
                  }}
                />
              )}
              {error && (
                <p className="contact-form__error" id={errorId}>
                  {error}
                </p>
              )}
            </div>
          );
        })}

        {/* Honeypot: off-screen and inert; bots fill it. */}
        <div className="contact-form__trap" aria-hidden="true" inert>
          <label htmlFor={`${id}-${honeypotField}`}>{t.honeypot}</label>
          <input
            id={`${id}-${honeypotField}`}
            type="text"
            name={honeypotField}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className="button contact-form__submit"
          aria-disabled={isPending || undefined}
        >
          {isPending ? t.pending : text(blok.submit_label, t.submit)}
        </button>

      </form>

      {/* Always rendered so screen readers register the region before its
          content changes. The key forces a new node, so an identical result
          on a later submission is announced again. */}
      <div role="status" aria-live="polite" className="contact-form__status">
        {isPending && <span className="visually-hidden">{t.pending}</span>}
        {/* Hidden: the errors are already shown next to each field. */}
        {!isPending && invalidCount > 0 && (
          <p key={state?.submittedAt} className="visually-hidden">
            {t.invalidFields(invalidCount)}
          </p>
        )}
        {!isPending && state?.ok === true && (
          <p
            key={state.submittedAt}
            className="contact-form__result contact-form__result--success"
          >
            {text(blok.success_message, t.success)}
          </p>
        )}
        {!isPending && errors.form && (
          <p
            key={state?.submittedAt}
            className="contact-form__result contact-form__result--error"
          >
            {text(blok.error_message, errors.form)}
          </p>
        )}
      </div>
    </section>
  );
}
