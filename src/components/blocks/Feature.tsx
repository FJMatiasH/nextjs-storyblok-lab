import type { ReactNode } from "react";
import { storyblokEditable } from "@storyblok/react/rsc";

type FeatureBlock = {
  _uid: string;
  _editable?: string;
  title?: string;
  text?: string;
  icon?: string;
  hasSectionTitle?: boolean;
  isInGrid?: boolean;
};

const icons = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  map: (
    <>
      <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  euro: (
    <>
      <path d="M17.5 6.2A7 7 0 1 0 17.5 17.8" />
      <path d="M4 10h9M4 14h9" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof icons;

function isIconName(key: string): key is IconName {
  return Object.hasOwn(icons, key);
}

function getIcon(name?: string): ReactNode {
  const key = name?.trim().toLowerCase();
  return key && isIconName(key) ? icons[key] : null;
}

export default function Feature({
  blok,
  hasSectionTitle = false,
  isInGrid = false,
}: {
  blok: FeatureBlock;
  hasSectionTitle?: boolean;
  isInGrid?: boolean;
}) {
  const icon = getIcon(blok.icon);

  return (
    <article
      className="feature"
      role={isInGrid ? "listitem" : undefined}
      {...storyblokEditable(blok)}
    >
      {icon && (
        <span className="feature__icon">
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon}
          </svg>
        </span>
      )}
      {blok.title &&
        (hasSectionTitle ? (
          <h3>{blok.title}</h3>
        ) : (
          <h2>{blok.title}</h2>
        ))}
      {blok.text && <p>{blok.text}</p>}
    </article>
  );
}
