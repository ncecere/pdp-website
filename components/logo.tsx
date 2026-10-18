import mark from "@/lib/mark.json";
import { site } from "@/lib/site";

/*
 * The Pi Durable Platform logo. The mark is inline SVG (no request, no font)
 * kept in lib/mark.json: mark-small.svg, the drawing for 20 to 47 px, which
 * scripts/og-image.mjs also reads (mark.svg) for the Open Graph card.
 * `npm run og` writes both from ../pdp-assets/logo/<source>/. Until the logo
 * is chosen, a neutral placeholder stands in (`placeholder: true`: an
 * outlined square on the family's dark tile). The name beside it is live
 * text. pdp-docs draws the same mark at the same size. Never use Pi's logos.
 *
 * This is the only place the site draws the logo (header and footer).
 */

/** The mark: decorative here, because the name is always next to it. */
export function Mark({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox={mark.viewBox}
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      // Static markup from lib/mark.json, written by us; no user input.
      dangerouslySetInnerHTML={{ __html: mark.svg }}
    />
  );
}

/** The mark and the name, as a link to the top of the page. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`inline-flex items-center gap-2.5 rounded-md font-semibold text-brand-text ${className}`}>
      <Mark />
      <Wordmark />
    </a>
  );
}

/** The wordmark itself: the product's full name, set in Inter. */
export function Wordmark({ className = "text-[1.05rem]" }: { className?: string }) {
  return <span className={`tracking-tight whitespace-nowrap ${className}`}>{site.name}</span>;
}
