import Link from "next/link";

// not-found files get no params, so the message is shown in both locales,
// each part marked with its own lang for screen readers.
export default function NotFoundContent() {
  return (
    <section className="not-found">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1 lang="en">Page not found</h1>
      <p lang="en">The page you are looking for does not exist or has moved.</p>
      <p lang="es">La página que buscas no existe o se ha movido.</p>
      <ul className="not-found__links">
        <li>
          <Link className="button" href="/en" hrefLang="en" lang="en">
            Go to the home page
          </Link>
        </li>
        <li>
          <Link
            className="button button--outline"
            href="/es"
            hrefLang="es"
            lang="es"
          >
            Ir a la página de inicio
          </Link>
        </li>
      </ul>
    </section>
  );
}
