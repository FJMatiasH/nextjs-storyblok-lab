import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import {
  PathnameContext,
  PathParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import ContactForm from "@/components/blocks/ContactForm";
import { submitContact } from "@/app/actions/contact";
import { buildContactSchema, contactMessages } from "@/lib/contact-schema";
import type { ContactFormState } from "@/lib/contact";
import { isLocale, type Locale } from "@/lib/i18n";

// The Server Action is the network boundary, so it is the only mock. It runs
// the real schema, so the messages come from the same source as production.
jest.mock("@/app/actions/contact", () => ({ submitContact: jest.fn() }));

const mockedSubmit = jest.mocked(submitContact);

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function validateLikeTheServer(
  _prev: ContactFormState | null,
  formData: FormData,
): Promise<ContactFormState> {
  const rawLocale = field(formData, "locale");
  const values = {
    name: field(formData, "name"),
    email: field(formData, "email"),
    message: field(formData, "message"),
  };
  const result = buildContactSchema(
    isLocale(rawLocale) ? rawLocale : "en",
  ).safeParse(values);

  if (result.success) return { ok: true, submittedAt: Date.now() };

  const { fieldErrors } = z.flattenError(result.error);
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

// The real useParams/usePathname read these contexts. The Next router
// normally provides them, so the test provides them instead of mocking hooks.
function renderAt(locale: Locale) {
  function Route({ children }: { children: ReactNode }) {
    return (
      <PathParamsContext.Provider value={{ locale }}>
        <PathnameContext.Provider value={`/${locale}`}>
          {children}
        </PathnameContext.Provider>
      </PathParamsContext.Provider>
    );
  }

  return render(<ContactForm blok={{ _uid: "contact-1" }} />, {
    wrapper: Route,
  });
}

beforeEach(() => {
  mockedSubmit.mockReset();
  mockedSubmit.mockImplementation(validateLikeTheServer);
});

describe("ContactForm", () => {
  it("shows an error for each empty field and focuses the first one", async () => {
    const user = userEvent.setup();
    renderAt("en");

    await user.click(screen.getByRole("button", { name: "Send message" }));

    const t = contactMessages.en;
    const name = screen.getByRole("textbox", { name: /^Name/ });
    expect(await screen.findByText(t.nameRequired)).toBeInTheDocument();
    expect(name).toHaveAccessibleDescription(t.nameRequired);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByRole("textbox", { name: /^Email/ }),
    ).toHaveAccessibleDescription(t.emailRequired);
    expect(
      screen.getByRole("textbox", { name: /^Message/ }),
    ).toHaveAccessibleDescription(t.messageRequired);
    expect(name).toHaveFocus();
  });

  it("shows the Spanish errors on the Spanish page", async () => {
    const user = userEvent.setup();
    renderAt("es");

    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    const t = contactMessages.es;
    expect(await screen.findByText(t.nameRequired)).toBeInTheDocument();
    expect(screen.getByText(t.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(t.messageRequired)).toBeInTheDocument();
  });

  it("announces success after a valid submission", async () => {
    const user = userEvent.setup();
    renderAt("en");

    await user.type(
      screen.getByRole("textbox", { name: /^Name/ }),
      "Ada Lovelace",
    );
    await user.type(
      screen.getByRole("textbox", { name: /^Email/ }),
      "ada@example.com",
    );
    await user.type(
      screen.getByRole("textbox", { name: /^Message/ }),
      "Can I invite my whole team?",
    );
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Thank you. Your message has been sent.",
    );
    expect(mockedSubmit).toHaveBeenCalledTimes(1);
    const formData = mockedSubmit.mock.calls[0][1];
    expect(formData.get("email")).toBe("ada@example.com");
    expect(formData.get("locale")).toBe("en");
  });
});
