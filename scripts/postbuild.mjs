// Runs after `next build`:
//  1. Hashes every inline <script> in out/**/*.html (Next.js inlines its page
//     payload) and writes build/security-headers.conf with those hashes in the
//     Content-Security-Policy, so script-src needs no 'unsafe-inline'.
//  2. Fails if the output references another origin for scripts, styles,
//     fonts, images or frames (the site must load nothing from third parties
//     at runtime).
//  3. Fails if the page text uses a name it must not (a named competitor, or
//     the homelab the product is developed on), or uses the short form "PDP"
//     before the full name "Pi Durable Platform".
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const ownHost = "pdp.bitop.dev";
// No comparisons with named competitors: other agent platforms, agent hosting
// and orchestration services, durable-execution products and model gateways.
// Pi and its durable package (what the agents are built with), the model
// providers it supports (OpenAI, Anthropic), Kubernetes, Agent Sandbox,
// gVisor and Kata are not competitors here. The page also never names the
// live instance or the infrastructure it runs on.
const forbidden = [
  /lang\s*(graph|smith|chain|flow)/i,
  /\bletta\b/i,
  /crew\s*ai/i,
  /\bautogen\b/i,
  /agent\s*core/i,
  /agent\s+engine/i,
  /bedrock/i,
  /vertex\s+ai/i,
  /ai\s+foundry/i,
  /copilot\s+studio/i,
  /agentforce/i,
  /\bdify\b/i,
  /flowise/i,
  /\bn8n\b/i,
  /relevance\s+ai/i,
  /\bmastra\b/i,
  /llama\s*index/i,
  /semantic\s+kernel/i,
  /botpress/i,
  /assistants\s+api/i,
  /agents\s+sdk/i,
  /\btemporal\.io\b|\btemporal\s+(cloud|workflows?)\b/i,
  /restate\.dev/i,
  /inngest/i,
  /trigger\.dev/i,
  /durable\s+(objects|functions)/i,
  /\be2b\b/i,
  /daytona/i,
  /cloudflare/i,
  /lite\s*llm/i,
  /portkey/i,
  /helicone/i,
  /open\s*router/i,
  /\bkong\b/i,
  /apigee/i,
  /bifrost/i,
  /truefoundry/i,
  /agents\.bitop\.dev/i,
  /\btalos\b/i,
  /authentik/i,
  /pangolin/i,
];
const fullName = "Pi Durable Platform";
const shortName = /\bPDP\b/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = walk(out);
const hashes = new Set();
const problems = [];

for (const file of files.filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    if (m[1].length === 0) continue;
    hashes.add(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  }
  for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*\b(?:src|href|srcset)="(https?:)?\/\/([^"/]+)[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const isCanonicalOrAlternate = m[1] === "link" && /rel="(canonical|alternate)"/.test(tag);
    if (!isCanonicalOrAlternate && m[3] !== ownHost) {
      problems.push(`${relative(root, file)}: third-party resource ${tag.slice(0, 120)}`);
    }
  }
  // Visible text and attributes only: drop scripts (the RSC payload repeats the text) and tags' JS.
  const text = html.replace(/<script[\s\S]*?<\/script>/g, " ");
  for (const re of forbidden) {
    const hit = text.match(re);
    if (hit) problems.push(`${relative(root, file)}: forbidden name "${hit[0]}"`);
  }
  // The short form only after the full name, in document order (head included).
  const shortAt = text.search(shortName);
  const fullAt = text.indexOf(fullName);
  if (shortAt !== -1 && (fullAt === -1 || shortAt < fullAt)) {
    problems.push(`${relative(root, file)}: "PDP" appears before "${fullName}"`);
  }
}
for (const file of files.filter((f) => f.endsWith(".css"))) {
  const css = readFileSync(file, "utf8");
  for (const m of css.matchAll(/url\(\s*["']?(https?:)?\/\/[^)]*\)|@import\s+["']?(https?:)?\/\//g)) {
    problems.push(`${relative(root, file)}: third-party url ${m[0].slice(0, 120)}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const template = readFileSync(join(root, "nginx", "security-headers.conf"), "utf8");
const conf = template.replace("__CSP_SCRIPT_HASHES__", [...hashes].sort().join(" "));
mkdirSync(join(root, "build"), { recursive: true });
writeFileSync(join(root, "build", "security-headers.conf"), conf);
console.log(
  `postbuild: ${hashes.size} inline script hashes in build/security-headers.conf; no third-party resources; no forbidden names; "${fullName}" before "PDP"`,
);
