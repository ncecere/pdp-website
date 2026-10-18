// Generates app/brand.css, the Pi Durable Platform brand tokens shared byte
// for byte by this website and the docs site (pdp-docs, app/brand.css), from
// the product's own UI theme:
//
//   <product>/web/src/components/ui/themes/neutral.css   colours and shadows
//   <product>/web/src/components/ui/styles/tokens.css    radii and font stacks
//
// The output depends only on those two files, so anyone who runs this script
// against the same product revision gets the same bytes. Run it in either
// repository, or copy the result, and compare with `cmp`.
//
//   npm run brand              write app/brand.css
//   npm run brand -- --check   exit 1 if app/brand.css is not what the sources give
//
// PRODUCT_DIR names the product repository; by default
// ../golang/pi-durable-platform next to this repository. CI never runs this:
// the result is committed.
//
// Rules (keep them in sync with the README):
//   - Light values come from the `:root, [data-theme="light"]` block, dark
//     values from the `[data-theme="dark"]` block; var(--…) references are
//     resolved to literal values (dark falls back to light for anything it
//     does not set).
//   - Each brand token takes one semantic token (`--pdp-bg` from `--color-bg`
//     and so on, listed in TOKENS below). The source line's trailing comment
//     (contrast ratios, purpose) is kept, prefixed with the source token.
//   - Values are copied as written, with runs of whitespace collapsed to one
//     space; colours keep their case.
//   - Radii (`--radius-control`, `--radius-card`, `--radius-popover`) and font
//     stacks (`--font-family-sans`, `--font-family-mono`) come from tokens.css.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = process.env.PRODUCT_DIR
  ? [resolve(process.env.PRODUCT_DIR)]
  : ["pi-durable-platform"].map((name) => join(root, "..", "golang", name));
const product = candidates.find((dir) => existsSync(join(dir, "web", "src", "components", "ui", "themes", "neutral.css")));
if (!product) {
  console.error(`No product repository with web/src/components/ui/themes/neutral.css in: ${candidates.join(", ")}`);
  process.exit(1);
}
const themeSrc = readFileSync(join(product, "web/src/components/ui/themes/neutral.css"), "utf8");
const tokensSrc = readFileSync(join(product, "web/src/components/ui/styles/tokens.css"), "utf8");

/** The declarations of the first rule whose selector list is exactly `selector`. */
function block(css, selector) {
  const at = css.indexOf(`${selector} {`);
  if (at === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", at);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

/** name -> { value, comment } for every custom property in a block. */
function declarations(body) {
  const out = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);([ \t]*\/\*([\s\S]*?)\*\/)?/g;
  for (const m of body.matchAll(re)) {
    out.set(m[1], { value: m[2].replace(/\s+/g, " ").trim(), comment: m[4]?.replace(/\s+/g, " ").trim() });
  }
  return out;
}

function resolver(...scopes) {
  const resolveValue = (value, depth = 0) => {
    if (depth > 10) throw new Error(`var() cycle in ${value}`);
    return value.replace(/var\((--[a-z0-9-]+)\)/g, (_, name) => {
      const hit = scopes.find((s) => s.has(name))?.get(name);
      if (!hit) throw new Error(`unresolved ${name}`);
      return resolveValue(hit.value, depth + 1);
    });
  };
  return (name) => {
    const hit = scopes.find((s) => s.has(name))?.get(name);
    if (!hit) throw new Error(`missing ${name}`);
    return { value: resolveValue(hit.value), comment: hit.comment };
  };
}

const light = declarations(block(themeSrc, ':root,\n[data-theme="light"]'));
const dark = declarations(block(themeSrc, '[data-theme="dark"]'));
const structure = declarations(block(tokensSrc, ":root"));
const lightOf = resolver(light);
const darkOf = resolver(dark, light);
const tokenOf = resolver(structure);

// Brand token <- the theme's semantic token, in groups.
const TOKENS = [
  ["Surfaces", [["bg", "--color-bg"], ["surface", "--color-surface"], ["surface-raised", "--color-surface-raised"], ["surface-sunken", "--color-surface-sunken"], ["surface-hover", "--color-surface-hover"]]],
  ["Text", [["text", "--color-text"], ["text-muted", "--color-text-muted"], ["text-subtle", "--color-text-subtle"], ["text-inverse", "--color-text-inverse"]]],
  ["Borders", [["border", "--color-border"], ["border-emphasis", "--color-border-emphasis"], ["border-strong", "--color-border-strong"]]],
  [
    "Indigo accent",
    [
      ["primary", "--color-primary"],
      ["primary-hover", "--color-primary-hover"],
      ["primary-active", "--color-primary-active"],
      ["primary-contrast", "--color-primary-contrast"],
      ["primary-subtle", "--color-primary-subtle"],
      ["primary-subtle-text", "--color-primary-subtle-text"],
      ["link", "--color-link"],
      ["link-hover", "--color-link-hover"],
      ["focus-ring", "--color-focus-ring"],
      ["highlight", "--color-highlight"],
    ],
  ],
  [
    "Status",
    [
      ["danger", "--color-danger"],
      ["danger-subtle", "--color-danger-subtle"],
      ["danger-text", "--color-danger-text"],
      ["success", "--color-success"],
      ["success-subtle", "--color-success-subtle"],
      ["success-text", "--color-success-text"],
      ["warning", "--color-warning"],
      ["warning-subtle", "--color-warning-subtle"],
      ["warning-text", "--color-warning-text"],
      ["info", "--color-info"],
      ["info-subtle", "--color-info-subtle"],
      ["info-text", "--color-info-text"],
    ],
  ],
  ["Shadows: a 1px ring plus diffuse layers", [["shadow-1", "--shadow-1"], ["shadow-2", "--shadow-2"], ["shadow-3", "--shadow-3"]]],
];

function lines(of, { comments, indent }) {
  const out = [];
  TOKENS.forEach(([group, items], i) => {
    if (i > 0) out.push("");
    if (comments) out.push(`${indent}/* ${group} */`);
    for (const [name, source] of items) {
      const { value, comment } = of(source);
      const note = comments ? ` /* ${source}${comment ? `: ${comment}` : ""} */` : "";
      out.push(`${indent}--pdp-${name}: ${value};${note}`);
    }
  });
  return out.join("\n");
}

const colorUtilities = TOKENS.flatMap(([, items]) => items)
  .filter(([name]) => !name.startsWith("shadow-"))
  .map(([name]) => {
    const utility = name === "text" ? "text" : name.replace(/^text-/, "").replace(/^focus-ring$/, "focus");
    return `  --color-brand-${utility}: var(--pdp-${name});`;
  });

const radius = (n) => tokenOf(n).value;

const css = `/*
 * Pi Durable Platform (PDP) brand tokens for Tailwind CSS v4.
 *
 * GENERATED by scripts/brand-css.mjs (npm run brand); do not edit by hand.
 * One file, shared byte for byte by the Pi Durable Platform website
 * (pdp-website, app/brand.css) and the docs (pdp-docs, app/brand.css).
 * Regenerate it from the product, or copy it, and check with:
 * cmp app/brand.css ../pdp-docs/app/brand.css
 *
 * The values come from Pi Durable Platform's own UI
 * (github.com/ncecere/pi-durable-platform), which uses the Bitop UI library:
 * web/src/components/ui/themes/neutral.css (the "neutral" theme: cool slate
 * neutrals with an indigo accent, light and dark; shadows) and
 * web/src/components/ui/styles/tokens.css (radii, font stacks). Each value
 * names its source token; contrast notes are the theme's own.
 *
 * Contrast (WCAG 2.1): body text, muted text, subtle text and links meet AA
 * (4.5:1) on bg, surface and surface-sunken in both modes. Control boundaries
 * (border-strong) and the focus ring meet 3:1. Decorative hairlines (border,
 * border-emphasis) and highlight carry no meaning. In dark mode the primary
 * indigo is a fill; text links use the lighter link colour.
 *
 * Import it after Tailwind:  @import "tailwindcss";  @import "./brand.css";
 * The font is Inter Variable, self-hosted by each site
 * (@fontsource-variable/inter); nothing is loaded from a CDN.
 *
 * Light values apply to :root. Dark values apply under .dark or
 * [data-theme="dark"], and follow the system setting when neither .light nor
 * [data-theme="light"] is set.
 */

:root,
.light,
[data-theme="light"] {
  color-scheme: light;

${lines(lightOf, { comments: true, indent: "  " })}
}

.dark,
[data-theme="dark"] {
  color-scheme: dark;

${lines(darkOf, { comments: true, indent: "  " })}
}

@media (prefers-color-scheme: dark) {
  :root:not(.light):not([data-theme="light"]) {
    color-scheme: dark;

${lines(darkOf, { comments: false, indent: "    " })}
  }
}

/*
 * Tailwind theme: utilities such as bg-brand-surface, text-brand-muted,
 * border-brand-border, bg-brand-primary, text-brand-link, rounded-card,
 * shadow-brand-2 and font-sans.
 */
@theme inline {
${colorUtilities.join("\n")}

  --shadow-brand-1: var(--pdp-shadow-1);
  --shadow-brand-2: var(--pdp-shadow-2);
  --shadow-brand-3: var(--pdp-shadow-3);

  /* Radii from tokens.css: controls, cards and dialogs, popovers. */
  --radius-control: ${radius("--radius-control")};
  --radius-card: ${radius("--radius-card")};
  --radius-popover: ${radius("--radius-popover")};

  --font-sans: ${tokenOf("--font-family-sans").value};
  --font-mono: ${tokenOf("--font-family-mono").value};
}
`;

const target = join(root, "app", "brand.css");
if (process.argv.includes("--check")) {
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current !== css) {
    console.error(`app/brand.css differs from what ${product} gives: run npm run brand`);
    process.exit(1);
  }
  console.log(`app/brand.css matches ${product}`);
} else {
  writeFileSync(target, css);
  console.log(`wrote app/brand.css from ${product}`);
}
