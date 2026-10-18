# pdp-website

The landing page for [Pi Durable Platform (PDP)](https://github.com/ncecere/pi-durable-platform), a self-hosted, open-source (MIT) console and API where a company's teams deploy, test and manage durable AI agents built with [Pi](https://github.com/earendil-works/pi)'s durable package: agents from a reviewed, versioned template catalog, each with its own PostgreSQL schema, woken on demand and hibernated when idle, with a model and MCP server catalog, service-account keys and OAuth Connect for apps, private and shared threads, usage reports, audit and OIDC sign-in. The site is served at https://pdp.bitop.dev; the documentation lives in its own repository and site, https://docs.pdp.bitop.dev.

It's one long page plus a 404 page, with no pricing, sign-up, forms, cookies, tracking or third-party requests. The text describes Pi Durable Platform **v0.1.0**, the first release (2026-10-18), and is checked against the product's `docs/releases/v0.1.0.md` (What's in it, Security model, Known limitations, Images), `CHANGELOG.md`, `README.md`, every section of `DESIGN.md` (Decisions, Personal workspaces, OAuth Connect, Models and Team model providers, MCP servers and Team MCP servers, Threads, Launchers, Verified so far, Known limits and open items), `api/openapi.yaml`, `.env.example`, the `Makefile`, the Dockerfiles, `.github/workflows/images.yml` and `image.yml` (the release images), `internal/authz`, `internal/serviceaccounts`, `internal/agenthost/launcher` and the screen names in `web/src` (`router.tsx`, `components/layout/nav.tsx`, `lib/tabs.ts`, `pages/connect`). Nothing on the page describes a feature that isn't built; planned work is named as planned in the project status card (`#status`): waking hibernating agents for scheduled work, files and artifacts on object storage, enforcing the personal-workspace budget, tool-call approvals, incremental event streams, and uploaded agents (after hostile-code isolation); the release notes list the same gaps as known limitations, and the card adds their "one platform replica". The page states no warm-pool wake time (the product documents none) and doesn't name a Docker Compose or celld backend (not in the product's plans).

`lib/site.ts` holds the version, the release day (`2026-10-18`; the footer and sitemap show it), the release notes link (the GitHub Release of `v0.1.0`), the repository links (pinned at `blob/v0.1.0`; move them to the next tag when the page describes a newer release), the two release images (`ghcr.io/ncecere/pi-durable-platform` and `ghcr.io/ncecere/pi-durable-platform-runtime`, with the cosign certificate identity) and the example host (`agents.example.com`, the host the screenshots and the docs show). **After the release, fill in `images.platformDigest` and `images.runtimeDigest`** (`sha256:…`, from the release notes): until then the page pulls and verifies the images by tag and says the digests are in the release notes; with them it uses the digests.

**Naming.** The page leads with "Pi Durable Platform" (title, hero, metadata) and uses "PDP" only as a short form after it. It is an independent project: it says so, says it isn't affiliated with or endorsed by Earendil (who make Pi), links to Pi and its durable package, and never uses Pi's logos. The text names no competing products (other agent platforms, agent hosting or orchestration services, durable-execution products, model gateways); the model providers it supports (OpenAI, Anthropic), Kubernetes, Agent Sandbox, gVisor and Kata are named because they are what it runs on or connects to. It also never names the live instance or the infrastructure the product is developed on. Examples use generic names (`agents.example.com`, `chat.example.com`, Example Corp, a `support` team). `scripts/postbuild.mjs` fails the build if a page uses a forbidden name or "PDP" before "Pi Durable Platform".

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) with `output: "export"`: `next build` writes plain static files to `out/`.
- React 19, TypeScript, [Tailwind CSS](https://tailwindcss.com) 4.
- Inter Variable, self-hosted from `@fontsource-variable/inter`.
- Node 22 (`.nvmrc`) and npm; every version is pinned in `package-lock.json` (the same versions as the Open MCP Portal website).
- nginx (alpine, pinned by digest) in the container.

## Brand tokens: `app/brand.css`

`app/brand.css` holds Pi Durable Platform's colours (light by default, and dark), radii, shadows and font stacks, and maps them to Tailwind v4 theme variables (`bg-brand-surface`, `text-brand-muted`, `bg-brand-primary`, `text-brand-link`, `rounded-card`, `shadow-brand-2` and so on). The docs site (pdp-docs, `app/brand.css`) uses **the same file, byte for byte**, and the same script, so the two sites look like one product.

The file is **generated**, not written by hand: `scripts/brand-css.mjs` derives it deterministically from the product's own UI theme, so anyone who runs it against the same product revision gets the same bytes:

```sh
npm run brand              # write app/brand.css from the product repository
npm run brand -- --check   # fail if app/brand.css differs from what the sources give
cmp app/brand.css ../pdp-docs/app/brand.css
cmp scripts/brand-css.mjs ../pdp-docs/scripts/brand-css.mjs
```

- **Sources:** `web/src/components/ui/themes/neutral.css` (the Bitop "neutral" theme: cool slate neutrals with an indigo accent; colours and shadows) and `web/src/components/ui/styles/tokens.css` (radii, font stacks) in the product repository. `PRODUCT_DIR` names it; by default `../golang/pi-durable-platform`.
- **Rules:** light values from the `:root, [data-theme="light"]` block, dark values from `[data-theme="dark"]`; `var(--…)` references resolved to literal values (dark falls back to light); each brand token `--pdp-<name>` takes one semantic token (`--pdp-bg` from `--color-bg`, `--pdp-text-muted` from `--color-text-muted`, `--pdp-focus-ring` from `--color-focus-ring`, `--pdp-shadow-1` from `--shadow-1`, … the full list is `TOKENS` in the script), keeping the source line's comment prefixed with the source token's name; whitespace in values collapsed to one space; radii (`--radius-control`, `--radius-card`, `--radius-popover`) and fonts (`--font-family-sans`, `--font-family-mono`) from `tokens.css`. The `@theme inline` block maps every token to the same Tailwind names the sister sites use.
- The product uses the same Bitop theme as Open MCP Portal and Open Model Gateway, so the values equal those sites'; only the `--pdp-` prefix and the comments differ.

Change the script in both repositories together. Components and `app/globals.css` use only the Tailwind names (in CSS through `--theme(--color-brand-…)`), never the raw token variables, so a new `brand.css` drops in without other changes. The theme follows the system (`prefers-color-scheme`); `data-theme="dark|light"` or `class="dark|light"` can force one.

## Logo, favicon and Open Graph card

The logo is "Wake": a 3 x 3 grid of dots on the family's dark tile, the one in the middle larger and fuchsia. Its source, exports and usage rules live in `../pdp-assets/logo/` (the mark is in the folder named by `source` in `lib/mark.json`; currently `wake`).

- `components/logo.tsx` is the only place the site draws the logo (header and footer): the mark as inline SVG (`mark-small.svg`, 28 px, `aria-hidden`) beside the name as live text. pdp-docs should draw it identically; change both together.
- `lib/mark.json` holds the mark as inner SVG markup on its 64 grid: `svg` is `mark-small.svg` (read by `components/logo.tsx`), `svgRegular` is `mark.svg` (read by `scripts/og-image.mjs`), `source` names the logo folder. `npm run og` writes all three from that folder; `placeholder: true` marks the neutral stand-in (an outlined square on the family's dark tile) the site used before the logo existed.
- `npm run og` (`scripts/og-image.mjs`) finds the logo folder (`LOGO_DIR`; else `../pdp-assets/logo/<source>`; else the only folder under `../pdp-assets/logo/` with every export: `mark.svg`, `mark-small.svg`, `favicon.ico`, `favicon.svg`, `png/apple-touch-icon.png`, `png/icon-192.png`, `png/icon-512.png`; concept folders such as `family/` are ignored), copies the five icons unchanged into `public/`, refreshes `lib/mark.json` (`placeholder: false`, `source`), and draws `public/og.png` (1200x630: the mark and name, the headline and, once that slot is filled, the `team-agents` screenshot) in the brand's dark colours. Without a logo folder it draws the icons (including a PNG-in-ICO `favicon.ico`) from the placeholder mark. Rerun it when the logo or the screenshot changes and commit the results.

## Screenshots

The page has 8 named screenshot slots in its web console section, listed in `lib/slots.json` with their alt text and captions. A slot without an image shows a clearly marked placeholder ("Screenshot coming soon") with the expected file name. All 8 are placeholders until the Example Corp capture lands in `../pdp-assets/screenshots/`.

```sh
npm run images   # copy the screenshots that exist into public/images as WebP, record their sizes
npm run og       # rebuild the Open Graph card and icons
```

Commit the results (`public/images/`, `lib/screenshots.json`, `public/og.png`, icons, `lib/mark.json`). Screenshots come from a fictional demo installation (Example Corp) in `../pdp-assets/screenshots/`; set `SCREENSHOTS_DIR` to read from another directory. For each slot the script looks for `file` (or the slot's own name) as `.png`, `.webp` or `.jpg` and, if that's missing, the slot's `interimFile`, recording `"interim": true` in `lib/screenshots.json`. The alt text and captions were written from the product's screens (`web/src`) before the capture: **check each against its image** when it lands.

| Slot | Shows |
|---|---|
| `team-agents` | Team › Agents: agents with template and version, team- or service-managed, Awake/Hibernating, last use (also used by `public/og.png`) |
| `agent-test` | An agent's Test tab: a conversation with model, usage and timing, and an MCP tool call |
| `deploy-agent` | Deploy an agent: template from the catalog or the team's own, name, model |
| `template-versions` | A template's Versions tab |
| `admin-models` | Admin › Models, Providers and Models tabs, with access mode and owner |
| `team-mcp-servers` | Team › MCP servers, Servers and Available tabs |
| `team-usage` | Team › Usage, by day, model or agent, with estimated cost |
| `oauth-consent` | The OAuth Connect consent page ("… wants to use your agents as you"); Account › Connected apps in the caption |

## Local development

```sh
npm ci
npm run dev      # http://localhost:3000
```

## Build

```sh
npm run typecheck
npm run build    # static export to out/, then scripts/postbuild.mjs
```

`scripts/postbuild.mjs` hashes the inline scripts Next.js writes into the HTML and puts them in the Content-Security-Policy (`build/security-headers.conf`), so `script-src` needs no `'unsafe-inline'`. It fails the build if the output loads a script, style sheet, font, image or frame from another origin, if the page text uses a forbidden name, or if "PDP" appears before "Pi Durable Platform".

To run the production image locally, read-only like in a cluster:

```sh
npm run docker   # builds the image and serves it on http://127.0.0.1:8080
```

## Container image and deployment

`.github/workflows/publish.yaml` builds the site on every pull request and push. On `main` it also builds and pushes a multi-arch (linux/amd64, linux/arm64) image, with every action pinned by commit SHA:

- `ghcr.io/ncecere/pdp-website:<full commit SHA>`
- `ghcr.io/ncecere/pdp-website:latest`

The image is nginx serving `out/`:

- runs as user 101, listens on port **8080**, and answers `GET /healthz` with `ok`;
- works with a read-only root filesystem: the pid file and temp paths are under `/tmp`, so mount an `emptyDir` (or tmpfs) there;
- sends security headers (CSP, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP);
- caches hashed assets under `/_next/static/` for a year (`immutable`), other assets for an hour, and revalidates pages on every request.

Deployment lives outside this repository. New GHCR packages start private; make the package public, or pull it with a registry credential.

Dependabot opens one grouped pull request a week each for npm, GitHub Actions and the Docker base images.

## Licence

- **Code:** MIT, see [`LICENSE`](LICENSE).
- **Website text:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), see [`LICENSE-CONTENT`](LICENSE-CONTENT).
- Inter is under the SIL Open Font License 1.1.
- Pi and its durable package belong to their authors; this project uses none of their logos.
