const repoUrl = "https://github.com/ncecere/pi-durable-platform";
const version = "v0.1.1";
// Links into the repository are pinned at the release tag, so they keep
// showing the files of the version this page describes. Move them (with
// `version`, `releaseDate` and the images below) when the page describes a
// newer release.
const tree = `${repoUrl}/blob/${version}`;

export const site = {
  name: "Pi Durable Platform",
  // The short form, used only after the full name has been given.
  // scripts/postbuild.mjs fails the build if "PDP" appears before it.
  shortName: "PDP",
  url: "https://pdp.bitop.dev",
  title: "Pi Durable Platform: deploy, test and manage your company's durable AI agents",
  description:
    "Pi Durable Platform (PDP) is a self-hosted, open-source console and API where a company's teams deploy, test and manage durable AI agents built with Pi's durable package, from a reviewed template catalog, with their own models and MCP servers, usage reports and audit.",
  docsUrl: "https://docs.pdp.bitop.dev",
  repoUrl,
  // The version this page describes: a fix release on top of the first
  // release, v0.1.0.
  version,
  // The release day of `version` (the footer and the sitemap show it).
  releaseDate: "2026-10-18" as string | null,
  // The GitHub Release of `version` (made by the repository's image workflow
  // from docs/releases/v0.1.1.md).
  releaseNotesUrl: `${repoUrl}/releases/tag/${version}`,
  releasesUrl: `${repoUrl}/releases`,
  // The roadmap is a living document (an order of work, not a schedule), so
  // it follows main rather than the tag; each item is an issue labelled
  // `roadmap`, with a milestone per phase.
  roadmapUrl: `${repoUrl}/blob/main/docs/roadmap.md`,
  roadmapIssuesUrl: `${repoUrl}/issues?q=is%3Aissue+label%3Aroadmap`,
  // The two release images (multi-arch, signed with cosign keyless signing by
  // the repository's image workflow at the tag). The page shows them by tag
  // until the digests are filled in here after the release; then it shows
  // and verifies them by digest.
  images: {
    platform: "ghcr.io/ncecere/pi-durable-platform",
    runtime: "ghcr.io/ncecere/pi-durable-platform-runtime",
    // "sha256:…" of each multi-arch index, from the release notes.
    platformDigest: "sha256:ef046ad6534aa056adf0f10b1a9e41d5e93793e17e911b8cefab750dd909b147" as string | null,
    runtimeDigest: "sha256:a7adb0c5f7913ff2f2ffd7783301f81d23caeeceb8d68abd48838e178d9d1168" as string | null,
    certificateIdentity: `${repoUrl}/.github/workflows/image.yml@refs/tags/${version}`,
    oidcIssuer: "https://token.actions.githubusercontent.com",
  },
  licenseUrl: `${tree}/LICENSE`,
  securityUrl: `${repoUrl}/security`,
  readmeUrl: `${tree}/README.md`,
  designUrl: `${tree}/DESIGN.md`,
  statusUrl: `${tree}/DESIGN.md#known-limits-and-open-items`,
  oauthConnectUrl: `${tree}/DESIGN.md#oauth-connect`,
  launchersUrl: `${tree}/DESIGN.md#launchers`,
  openapiUrl: `${tree}/api/openapi.yaml`,
  envExampleUrl: `${tree}/.env.example`,
  // Pi, whose durable package the agents are built with. A separate project
  // by other people (Earendil): link to it, never use its logos.
  piUrl: "https://github.com/earendil-works/pi",
  piDurableUrl: "https://github.com/earendil-works/pi/tree/main/packages/durable",
  agentSandboxUrl: "https://agent-sandbox.sigs.k8s.io",
  websiteRepoUrl: "https://github.com/ncecere/pdp-website",
  // The example platform used in every snippet on the page (and in the
  // Example Corp screenshots and the docs' examples).
  exampleHost: "agents.example.com",
} as const;

/** An image reference: by digest once known, else by the release tag. */
export function imageRef(name: string, digest: string | null): string {
  return digest ? `${name}@${digest}` : `${name}:${site.version}`;
}
