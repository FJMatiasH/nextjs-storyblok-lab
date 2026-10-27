import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { toSitePath } from "@/lib/site";
import { linksTag, storyTag } from "@/lib/storyblok";

// Storyblok story webhook, e.g. {"action":"published","full_slug":"en/about",...}.
type StoryWebhookBody = { full_slug: string; action?: string };

/** Constant-time compare; hashing first hides the secret's length too. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function parseBody(body: unknown): StoryWebhookBody | null {
  if (typeof body !== "object" || body === null || !("full_slug" in body)) {
    return null;
  }

  const fullSlug = body.full_slug;
  if (typeof fullSlug !== "string") return null;

  const trimmed = fullSlug.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed.length > 200 || /\s/.test(trimmed)) return null;

  const action =
    "action" in body && typeof body.action === "string" ? body.action : undefined;
  return { full_slug: trimmed, action };
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) {
    return Response.json(
      { message: "REVALIDATE_SECRET is not configured." },
      { status: 500 },
    );
  }

  const provided = request.nextUrl.searchParams.get("secret") ?? "";
  if (!secretsMatch(provided, expected)) {
    return Response.json({ message: "Invalid secret." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ message: "Body must be JSON." }, { status: 400 });
  }

  const body = parseBody(json);
  if (!body) {
    return Response.json(
      { message: "Body must include a story full_slug." },
      { status: 400 },
    );
  }

  const path = toSitePath(body.full_slug);

  // "max": serve stale content while the next request refetches in the background.
  revalidateTag(storyTag(body.full_slug), "max");
  revalidateTag(linksTag, "max");
  revalidatePath(path);

  return Response.json({
    revalidated: true,
    action: body.action,
    tag: storyTag(body.full_slug),
    path,
  });
}
