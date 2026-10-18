// Builds the brand images:
//   public/og.png             the Open Graph card (1200x630): the mark and name,
//                             the headline and, when that slot is filled, the
//                             team agents screenshot; colours from app/brand.css
//                             (its dark values)
//   public/favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png,
//   icon-512.png              copied unchanged from the chosen logo folder in
//                             pdp-assets (logo/<name>/) when it exists;
//                             otherwise drawn from the placeholder mark in
//                             lib/mark.json
//   lib/mark.json             `svg` and `svgRegular` refreshed from the logo
//                             folder's mark-small.svg and mark.svg
//
// The logo folder is, in order: LOGO_DIR; ../pdp-assets/logo/<source> when
// lib/mark.json names a `source`; otherwise the only folder under
// ../pdp-assets/logo/ that holds every exported file (mark.svg,
// mark-small.svg, favicon.ico, favicon.svg, png/apple-touch-icon.png,
// png/icon-192.png, png/icon-512.png). Concept folders without the full set of
// exports are ignored; with several complete folders, set LOGO_DIR (or
// `source`) to choose.
//
// Run locally (`npm run og`) after `npm run images` or a logo change, and
// commit the results; CI never reads pdp-assets. Until the logo is chosen
// (lib/mark.json `placeholder: true`, no `source`), the icons are drawn from
// the placeholder mark; once ../pdp-assets/logo/<source>/ holds the exports,
// the same command copies them and records `source`.
import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const markPath = join(root, "lib", "mark.json");
const mark = JSON.parse(readFileSync(markPath, "utf8"));

// Colours come from the shared brand file: the dark block's value of each
// token, so the card follows brand.css without copying it.
const brand = readFileSync(join(root, "app", "brand.css"), "utf8");
const darkBlock = brand.slice(brand.indexOf(".dark,"));
function token(name, fallback) {
  const m = darkBlock.match(new RegExp(`--[a-z]+-${name}:\\s*(#[0-9a-fA-F]{3,8})\\b`));
  return m ? m[1] : fallback;
}
const bg = token("bg", "#0b0d12");
const text = token("text", "#eceef2");
const muted = token("text-muted", "#9ba3b0");
const glow = token("primary", "#5357e6");

const font = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// ---------------------------------------------------------------- the logo
const icons = [
  ["favicon.ico", "favicon.ico"],
  ["favicon.svg", "favicon.svg"],
  ["png/apple-touch-icon.png", "apple-touch-icon.png"],
  ["png/icon-192.png", "icon-192.png"],
  ["png/icon-512.png", "icon-512.png"],
];
const required = ["mark.svg", "mark-small.svg", ...icons.map(([from]) => from)];
const complete = (dir) => required.every((f) => existsSync(join(dir, f)));

function findLogoDir() {
  if (process.env.LOGO_DIR) return resolve(process.env.LOGO_DIR);
  const logoRoot = join(root, "..", "pdp-assets", "logo");
  if (mark.source) return join(logoRoot, mark.source);
  if (!existsSync(logoRoot)) return null;
  const found = readdirSync(logoRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(logoRoot, e.name))
    .filter(complete);
  if (found.length > 1) {
    console.error(`Several complete logo folders: ${found.map((d) => basename(d)).join(", ")}. Set LOGO_DIR or "source" in lib/mark.json.`);
    process.exit(1);
  }
  return found[0] ?? null;
}

/** The inner markup and viewBox of a standalone SVG file. */
function inner(file) {
  const svg = readFileSync(file, "utf8");
  const open = svg.match(/<svg\b[^>]*>/);
  if (!open) throw new Error(`no <svg> in ${file}`);
  const viewBox = open[0].match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 64 64";
  const body = svg
    .slice(open.index + open[0].length, svg.lastIndexOf("</svg>"))
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/>\s+</g, "><")
    .trim();
  return { viewBox, body };
}

const logoDir = findLogoDir();
const haveLogo = Boolean(logoDir && complete(logoDir));
if (logoDir && !haveLogo) console.warn(`${logoDir} lacks some of ${required.join(", ")}: using the placeholder mark`);

if (haveLogo) {
  for (const [from, to] of icons) copyFileSync(join(logoDir, from), join(pub, to));
  const small = inner(join(logoDir, "mark-small.svg"));
  const regular = inner(join(logoDir, "mark.svg"));
  if (small.viewBox !== regular.viewBox) throw new Error("mark.svg and mark-small.svg have different viewBoxes");
  const next = {
    ...mark,
    placeholder: false,
    source: process.env.LOGO_DIR ? mark.source : basename(logoDir),
    viewBox: small.viewBox,
    svg: small.body,
    svgRegular: regular.body,
  };
  writeFileSync(markPath, JSON.stringify(next, null, 2) + "\n");
  Object.assign(mark, next);
} else {
  // No logo yet: draw the icons from the placeholder mark.
  const tile = (markup, size) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.viewBox}" width="${size}" height="${size}">${markup}</svg>`;
  writeFileSync(join(pub, "favicon.svg"), tile(mark.svg, 64) + "\n");
  const png = (markup, size) => sharp(Buffer.from(tile(markup, size))).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  // apple-touch-icon is full-bleed (iOS rounds it): the tile colour fills the square.
  const fill = mark.svgRegular.match(/fill="(#[0-9a-fA-F]{3,8})"/)?.[1] ?? "#161a22";
  const fullBleed = mark.svgRegular.replace(/rx="[^"]*"/, 'rx="0"');
  await sharp(await png(fullBleed, 180)).flatten({ background: fill }).toFile(join(pub, "apple-touch-icon.png"));
  await sharp(await png(mark.svgRegular, 192)).toFile(join(pub, "icon-192.png"));
  await sharp(await png(mark.svgRegular, 512)).toFile(join(pub, "icon-512.png"));
  // favicon.ico: 16, 32 and 48 px PNGs in one ICO (PNG entries, Vista and later).
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map((s) => png(s >= 48 ? mark.svgRegular : mark.svg, s)));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((s, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(s, at);
    header.writeUInt8(s, at + 1);
    header.writeUInt16LE(1, at + 4); // colour planes
    header.writeUInt16LE(32, at + 6); // bits per pixel
    header.writeUInt32LE(images[i].length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += images[i].length;
  });
  writeFileSync(join(pub, "favicon.ico"), Buffer.concat([header, ...images]));
}

// ------------------------------------------------------- Open Graph card
const W = 1200;
const H = 630;
const shot = join(pub, "images", "team-agents.webp");
const hasShot = existsSync(shot);
const headline = hasShot
  ? ["Deploy, test and", "manage your teams'", "durable AI agents."]
  : ["Deploy, test and manage your", "teams' durable AI agents."];

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="0.15" cy="0" r="1">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.45"/>
      <stop offset="0.6" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <svg x="80" y="86" width="56" height="56" viewBox="${mark.viewBox}">${mark.svgRegular}</svg>
  <text x="152" y="128" font-family="${font}" font-size="40" font-weight="600" fill="${text}" letter-spacing="-0.5">Pi Durable Platform</text>
  <text font-family="${font}" font-weight="600" fill="${text}" font-size="${hasShot ? 50 : 60}" letter-spacing="-1.5">
    ${headline.map((line, i) => `<tspan x="80" y="${280 + i * (hasShot ? 62 : 74)}">${line.replace(/'/g, "&#8217;")}</tspan>`).join("")}
  </text>
  <text x="80" y="${H - 70}" font-family="${font}" font-size="26" fill="${muted}">Open source (MIT) · Self-hosted · Templates, models, MCP tools and audit</text>
</svg>`;

const layers = [];
if (hasShot) {
  const shotWidth = 520;
  const { data, info } = await sharp(shot).resize({ width: shotWidth }).png().toBuffer({ resolveWithObject: true });
  const height = Math.min(info.height, H - 160);
  const cropped = await sharp(data).extract({ left: 0, top: 0, width: info.width, height }).toBuffer();
  const mask = Buffer.from(
    `<svg width="${info.width}" height="${height}"><rect width="${info.width}" height="${height}" rx="16" fill="#fff"/></svg>`,
  );
  const rounded = await sharp(cropped).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  layers.push({ input: rounded, left: W - shotWidth - 60, top: 60 });
}

await sharp(Buffer.from(svg)).composite(layers).png({ compressionLevel: 9, palette: false }).toFile(join(pub, "og.png"));
console.log(
  `wrote public/og.png${hasShot ? " (with the team agents screenshot)" : ""}; ${
    haveLogo
      ? `copied ${icons.map(([, to]) => to).join(", ")} and the mark from ${logoDir}`
      : "drew the icons from the placeholder mark (no logo folder yet)"
  }`,
);
