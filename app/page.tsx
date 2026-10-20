import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  Github,
  Layers,
  Library,
  LogIn,
  MessageSquare,
  Moon,
  Network,
  Plug,
  Server,
  Shield,
  Users,
} from "@/components/icons";
import { Screenshot, type SlotName } from "@/components/Screenshot";
import { ButtonLink, CheckList, CodeBlock, Eyebrow, Note, SectionHeading, Strong, TextLink } from "@/components/ui";
import { imageRef, site } from "@/lib/site";

/*
 * Every claim here is checked against Pi Durable Platform v0.1.0
 * (github.com/ncecere/pi-durable-platform) and again for v0.1.1 and v0.1.2,
 * fix releases (docs/releases/v0.1.1.md: no migrations or settings; staff see
 * any team's agents read-only and can't hibernate them; doctor checks the
 * agents database. docs/releases/v0.1.2.md: the platform serves a connecting
 * app's logo, the agent page's badge follows wake and hibernate):
 * docs/releases/v0.1.0.md (What's
 * in it, Security model, Known limitations, Images), CHANGELOG.md, README.md, every section of DESIGN.md (Decisions, Personal workspaces,
 * OAuth Connect, Models and Team model providers, MCP servers and Team MCP
 * servers, Threads, Launchers, Verified so far, Known limits and open
 * items), api/openapi.yaml, .env.example, the Makefile, the Dockerfiles,
 * .github/workflows/images.yml and image.yml (the release images),
 * migrations/, runtime/ (src and test), internal/agenthost/launcher,
 * internal/authz, internal/serviceaccounts and the screen names in web/src
 * (router.tsx, components/layout/nav.tsx, lib/tabs.ts, pages/connect).
 * v0.2.0 (docs/releases/v0.2.0.md: What changed, Upgrading, Known limitations,
 * Images and chart) adds what v0.2 built: deploy/README.md,
 * deploy/helm/pi-durable-platform/README.md and deploy/kustomize/README.md
 * (the Helm chart, Kustomize base and overlays, RBAC, NetworkPolicies, the
 * kind smoke test, the signed chart), `rekey` and `doctor` (internal/rekey,
 * internal/doctor), .env.example (the complete configuration reference),
 * DESIGN.md "Threads" (platform-chosen thread IDs, thread MCP servers),
 * "Sign-in and group membership" (re-checking groups) and "Agent storage and
 * ownership" (the ownership record and prune-roles), "Several replicas"
 * (and docs/replicas.md, deploy/README.md "Replicas": two replicas, the
 * runtime's openStreams, one reaper at a time, a lock per agent start),
 * "Observability" (metrics, labels, OTLP/HTTP traces; deploy/README.md
 * "Monitoring", deploy/grafana/), and the chart's values (internal/config,
 * deploy/helm/pi-durable-platform).
 * v0.3.0 ("Apps at scale", 2026-10-20; docs/releases/v0.3.0.md: What changed,
 * Fixed and hardened, Upgrading, Known limitations, Images and chart) is
 * checked against DESIGN.md "Threads" (paging and search, incremental
 * event streams, steering), "Creating and moving agents" and
 * docs/agent-keys-and-moves.md, "OAuth Connect" (scopes, prompt=none,
 * login_hint, app secrets, the app event stream, usage per app), "Models ›
 * Usage" (several agents, agent by day), "MCP servers" (app-only tools),
 * api/openapi.yaml and web/src (test-chat.tsx, move-agent.tsx,
 * app-secrets-section.tsx, admin/usage/app-filter.tsx, team/usage).
 * v0.4.0 ("Agents that run on their own", 2026-10-20) is checked against
 * the product's design notes at the merge of feat/v04-firstparty and
 * fix/v04-security: docs/custom-agents.md (the library, custom state for
 * apps, the upgrade check), docs/runtime-contract.md, docs/triggers.md
 * (schedules, signed webhooks, runs, limits, callbacks, agent-made
 * schedules), docs/hibernation.md, docs/approvals.md, docs/mcp-identity.md,
 * docs/first-party-agents.md, examples/custom-agent/, .env.example
 * (AGENTS_BACKGROUND_MAX, TRIGGERS_*), migrations 00021 to 00026,
 * api/openapi.yaml and web/src (triggers-tab.tsx, runs-tab.tsx,
 * approvals-tab.tsx, kind-fields.tsx, approval-fields.tsx, the MCP server's
 * Identity settings).
 * Planned work in the status card: docs/roadmap.md (revised 2026-10-20: its
 * phases v0.5, v0.6 and Later, each item an issue labelled `roadmap`).
 * Keep it that way: nothing on this page may describe a feature that isn't
 * built. Planned work is named as planned, in the project status card.
 */

const host = `https://${site.exampleHost}`;

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <ForApps />
      <Screenshots />
      <SelfHost />
      <OpenSource />
    </>
  );
}

/* ---------------------------------------------------------------- Hero */

// README.md "Reaching agents from an app"; api/openapi.yaml (AgentEnsure,
// AgentMessageCreate, the thread events route).
const heroExample = `PLATFORM=${host}
KEY=pdp_sa_...   # a team service account's key

# One agent per user of your app: created the
# first time, returned after that
curl -X PUT \\
  $PLATFORM/v1/teams/support/agents/by-key/user-42 \\
  -H "Authorization: Bearer $KEY" \\
  -d '{"name": "Assistant for user 42"}'

# Send a message; a hibernating agent wakes up
curl -X POST \\
  $PLATFORM/v1/agents/$AGENT/threads/conv-1/messages \\
  -H "Authorization: Bearer $KEY" \\
  -d '{"text": "Where is my order?", "requestId": "m1"}'

# Follow the conversation as server-sent events
curl -N -H "Authorization: Bearer $KEY" \\
  $PLATFORM/v1/agents/$AGENT/threads/conv-1/events`;

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero-glow relative overflow-hidden border-b border-brand-border">
      <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="min-w-0">
          <a
            href="#status"
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-border-emphasis bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted hover:text-brand-text"
          >
            <span className="shrink-0 rounded-full bg-brand-primary-subtle px-2 py-0.5 text-brand-primary-subtle-text">{site.version}</span>
            <span className="truncate">Agents that run on their own · Open source, MIT</span>
            <ArrowRight className="size-3.5 shrink-0" />
          </a>
          <p className="mt-6 text-base font-semibold text-brand-text">{site.name}</p>
          <h1 id="hero-title" className="mt-2 text-4xl font-semibold tracking-tight text-brand-text sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            Deploy, test and manage your teams&apos; durable AI agents
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-muted">
            {site.name} ({site.shortName}) is a self-hosted console and API for agents built with{" "}
            <TextLink href={site.piDurableUrl}>Pi&apos;s durable package</TextLink>. Teams deploy agents from a reviewed
            template catalog and test them in the console; their apps reach them through the API. Each agent keeps its
            conversations in its own PostgreSQL schema, survives restarts, and sleeps when nobody is using it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={site.docsUrl}>
              <BookOpen className="size-4" />
              Read the docs
            </ButtonLink>
            <ButtonLink href={site.repoUrl} variant="secondary">
              <Github className="size-4" />
              View on GitHub
            </ButtonLink>
          </div>
          <p className="mt-6 max-w-xl text-sm text-brand-subtle">
            Self-hosted: one Go service with its web UI built in, PostgreSQL, and an agent runtime started on demand, as
            pods on Kubernetes or Agent Sandbox. An independent open-source project, not affiliated with or endorsed by
            Earendil, the makers of Pi.
          </p>
        </div>
        <div className="min-w-0">
          <CodeBlock label="Reach an agent from your app">{heroExample}</CodeBlock>
          <p className="mt-3 text-sm text-brand-muted">
            Apps talk only to the platform. It checks the caller, wakes the agent&apos;s runtime and relays the
            conversation; runtimes are never exposed.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- The problem */

const problems: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <Database className="size-5" />,
    title: "Agents that forget",
    body: "An agent that lives in one process loses its conversation, or the reply it was writing, when that process restarts. Keeping thousands of them running all the time just to stay safe doesn't scale.",
  },
  {
    icon: <Cpu className="size-5" />,
    title: "Keys and tools everywhere",
    body: "Every team wires its own agents to models and tools, with keys in each deployment. Nobody can say which agent uses which model or tool, or what it costs.",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Nothing to govern with",
    body: "There is no reviewed list of what agents may be deployed, no separation between one team's conversations and another's, and no record of who changed what.",
  },
];

function Problem() {
  return (
    <section aria-labelledby="problem-title" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading id="problem-title" eyebrow="The problem" title="Durable agents need somewhere to live">
          <p>
            Once a company&apos;s teams build agents into their apps, someone has to run them, keep their state safe,
            give them models and tools, and answer for what they do.
          </p>
        </SectionHeading>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {problems.map((p) => (
            <li key={p.title} className="rounded-card border border-brand-border bg-brand-surface p-6">
              <span className="flex size-9 items-center justify-center rounded-md bg-brand-primary-subtle text-brand-primary-subtle-text">
                {p.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-brand-text">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- How it works */

function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-control border border-brand-border-emphasis bg-brand-surface px-3 py-2 text-sm font-medium text-brand-text">
      {children}
    </li>
  );
}

/** Points right on wide screens, down when the diagram stacks. Decorative. */
function FlowArrow() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center text-brand-subtle">
      <svg viewBox="0 0 24 24" className="size-6 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M4 12h16M14 6l6 6-6 6" />
      </svg>
    </div>
  );
}

// DESIGN.md "Architecture", decisions 5 to 7, "Threads" and "Launchers".
const platformSteps: { title: string; body: string }[] = [
  { title: "Sign in", body: "A browser session, a personal API key, a service account key or an app's OAuth Connect token." },
  { title: "Allow", body: "The caller's team role, who manages the agent, and whether the thread is private to someone else." },
  { title: "Wake", body: "If the agent is hibernating, start its runtime: a pod, a Sandbox, or a standby runtime from a warm pool." },
  { title: "Relay", body: "The message goes to the runtime with the agent's own token; the reply streams back as server-sent events." },
  { title: "Record", body: "The thread and its authors, model usage, MCP calls and every change, in the audit log." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-16 border-t border-brand-border bg-brand-surface-sunken py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading id="how-title" eyebrow="How it works" title="Apps in front, one runtime per active agent behind">
          <p>
            Every request to an agent goes through the platform, which authenticates, authorizes and proxies it. Each
            agent is one Pi durable agent in its own runtime, with its state in PostgreSQL, so it can wake anywhere.
          </p>
        </SectionHeading>

        <figure className="mt-12">
          <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.5fr_auto_1fr]">
            <div className="rounded-card border border-brand-border bg-brand-surface p-5">
              <p className="text-sm font-semibold text-brand-subtle">Apps and people</p>
              <ul className="mt-4 space-y-2">
                <Chip>Your chat app</Chip>
                <Chip>A support tool</Chip>
                <Chip>The console&apos;s test chat</Chip>
                <Chip>Scripts and services</Chip>
              </ul>
              <p className="mt-4 text-xs text-brand-subtle">
                to <code className="font-mono">/v1/agents/&lt;id&gt;/threads/…</code>
              </p>
            </div>

            <FlowArrow />

            <div className="rounded-card border-2 border-brand-primary bg-brand-surface p-5 shadow-brand-2">
              <p className="text-sm font-semibold text-brand-text">{site.name}</p>
              <ol className="mt-4 space-y-3">
                {platformSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary-subtle text-xs font-semibold text-brand-primary-subtle-text">
                      {i + 1}
                    </span>
                    <span className="text-sm text-brand-muted">
                      <Strong>{s.title}.</Strong> {s.body}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-brand-border pt-3 text-xs text-brand-subtle">
                Teams, templates, agents, threads and records in PostgreSQL · web console for teams and admins
              </p>
            </div>

            <FlowArrow />

            <div className="grid gap-4">
              <div className="rounded-card border border-brand-border bg-brand-surface p-5">
                <p className="text-sm font-semibold text-brand-subtle">One runtime per active agent</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  <Chip>A Pi durable agent</Chip>
                  <Chip>Its own schema and database role</Chip>
                  <Chip>Hibernates when idle</Chip>
                </ul>
              </div>
              <div className="rounded-card border border-brand-border bg-brand-surface p-5">
                <p className="text-sm font-semibold text-brand-subtle">Through the platform&apos;s gateway</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  <Chip>Models from the catalog</Chip>
                  <Chip>MCP servers and their tools</Chip>
                </ul>
              </div>
            </div>
          </div>
          <figcaption className="mt-4 text-sm text-brand-muted">
            An idle agent has no runtime and no database connection. The next request wakes it, and it carries on from
            what PostgreSQL holds, including a reply that was interrupted.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Features */

function FeatureCard({
  id,
  icon,
  eyebrow,
  title,
  lead,
  bullets,
  note,
  wide = false,
}: {
  id: string;
  icon?: ReactNode;
  eyebrow: string;
  title: string;
  lead: ReactNode;
  bullets: ReactNode[];
  note?: ReactNode;
  wide?: boolean;
}) {
  return (
    <article
      aria-labelledby={id}
      className={`flex min-w-0 flex-col rounded-card border border-brand-border bg-brand-surface p-6 sm:p-8 ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary-subtle text-brand-primary-subtle-text">
            {icon}
          </span>
        ) : null}
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h3 id={id} className="mt-3 text-xl font-semibold tracking-tight text-brand-text sm:text-2xl">
        {title}
      </h3>
      <div className="mt-3 space-y-3 leading-relaxed text-brand-muted">{lead}</div>
      <CheckList items={bullets} columns={wide} />
      {note ? <Note>{note}</Note> : null}
    </article>
  );
}

function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-16 border-t border-brand-border py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading id="features-title" eyebrow="Features" title="From a reviewed template to an agent your app can call">
          <p>
            {site.shortName} is one installation for one company. Agents belong to a team or to a person&apos;s
            personal workspace. Team owners and admins manage their team; platform admins review, configure and see
            everything; platform auditors see the same, read-only.
          </p>
        </SectionHeading>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* DESIGN.md decisions 8 and 13; api/openapi.yaml (templates, versions, publish, review); migrations/00007 */}
          <FeatureCard
            id="feature-templates"
            icon={<Library className="size-5" />}
            eyebrow="Templates and catalog"
            title="Templates are what you govern"
            lead={
              <p>
                Every agent comes from a template: its instructions, the model it runs on, the MCP tools it gets, and
                which of them ask a person first. Teams don&apos;t upload code; agents run the runtime the operator
                deploys.
              </p>
            }
            bullets={[
              <>
                <Strong>A catalog</Strong> of platform templates, curated by platform admins, and team templates
                published after a platform admin&apos;s review: approved into the catalog, or rejected with a note.
              </>,
              <>
                <Strong>Versioned:</Strong> a version never changes once made. New agents get the current one; an
                existing agent keeps its version until someone upgrades or rolls it back.
              </>,
              <>
                <Strong>Team templates</Strong> stay private to the team until it asks to publish them, and may use the
                team&apos;s own models and MCP servers, which keeps them out of the catalog.
              </>,
              <>
                <Strong>A kind for each version:</Strong> the assistant, a <Strong>triage</Strong> agent that keeps a
                queue of a tracker&apos;s new items, drafts replies and asks before it writes, or a{" "}
                <Strong>deep researcher</Strong> that plans, runs subagents in parallel, keeps its sources and answers
                with a report.
              </>,
              <>
                <Strong>Ask first:</Strong> a version lists tools that wait for a person&apos;s approval. The call
                waits through restarts and hibernation; a denied call is refused and the agent is told why.
              </>,
            ]}
          />

          {/* DESIGN.md decisions 3 to 6, "Launchers", "Verified so far"; runtime/test */}
          <FeatureCard
            id="feature-durable"
            icon={<Moon className="size-5" />}
            eyebrow="Durable agents"
            title="State in PostgreSQL, runtimes on demand"
            lead={
              <p>
                Each agent is one Pi durable agent in its own runtime. Its conversations live in its own PostgreSQL
                schema, under its own database role, in a database separate from the platform&apos;s.
              </p>
            }
            bullets={[
              <>
                <Strong>Survives restarts:</Strong> a restarted agent keeps its conversations, deduplicates retried
                requests, and finishes a reply that was cut off.
              </>,
              <>
                <Strong>One owner at a time:</Strong> the owner is recorded in the agent&apos;s own schema, tied to its
                runtime&apos;s only database connection, so a stale runtime can&apos;t write once it loses it, and no
                other agent&apos;s role can block or take it.
              </>,
              <>
                <Strong>Isolated:</Strong> an agent&apos;s role can&apos;t read another agent&apos;s schema, and a runtime
                answers only requests that carry its agent&apos;s own token, which the platform adds.
              </>,
              <>
                <Strong>Hibernates when idle</Strong> (after 10 minutes by default; no pod, no connection), and wakes
                on the next request. Background work, such as a background subagent, keeps it awake up to a ceiling;
                waiting for a person&apos;s approval doesn&apos;t. Its page says what keeps it awake.
              </>,
              <>
                <Strong>Several platform replicas:</Strong> two replicas behind one Service keep the platform up
                through node drains and rollouts. An agent&apos;s own runtime says whether it is idle, so no replica
                hibernates an agent that another is using, and starting an agent is serialised by a database lock.
              </>,
            ]}
            note={
              <>
                Pi&apos;s own storage runs unchanged on PostgreSQL: the durable package&apos;s storage conformance suite
                (24 cases) passes against it.
              </>
            }
          />

          {/* DESIGN.md decisions 11 and 12, "Personal workspaces"; internal/serviceaccounts */}
          <FeatureCard
            id="feature-teams"
            icon={<Users className="size-5" />}
            eyebrow="Teams and workspaces"
            title="Agents belong to a team, or to one person"
            wide
            lead={
              <p>
                Ownership, data and cost follow the team. People sign in with your identity provider over OpenID
                Connect, optionally limited to some email domains or groups, which the platform keeps re-checking while
                people are signed in.
              </p>
            }
            bullets={[
              <>
                <Strong>Team roles:</Strong> owners and admins manage members, service accounts and the team&apos;s own
                models and MCP servers; editors deploy agents and write templates; members use the team&apos;s agents.
              </>,
              <>
                <Strong>Service accounts</Strong> for the team&apos;s apps: a member or editor role, keys that always
                expire, and up to two active keys so they rotate without downtime.
              </>,
              <>
                <Strong>Service-managed agents:</Strong> an app creates one per user by key in a shared team, and the
                database makes sure such an agent is always service-managed. Only the team&apos;s service accounts talk
                to them; owners and admins see and delete them, never read them.
              </>,
              <>
                <Strong>Move an agent</Strong> with its conversations to another team or a personal workspace. A dry run
                shows first who gains and loses access, and what the target team lacks. The agent always starts with its
                new team&apos;s settings: a request already under way can&apos;t bring back the old team&apos;s.
              </>,
              <>
                <Strong>Groups are re-checked:</Strong> remove someone from the allowed group and, within a check
                interval, their sessions end, their connected apps are disconnected and their API keys stop working.
                Admins see <Strong>Group access ended</Strong> on their page.
              </>,
              <>
                <Strong>Personal workspaces:</Strong> where platform admins turn them on, everyone gets one, deploying
                catalog templates, with limits on agents and on agents running at once.
              </>,
            ]}
          />

          {/* DESIGN.md "Models", "Team model providers"; api/openapi.yaml (ModelProviderCreate, ModelCreate) */}
          <FeatureCard
            id="feature-models"
            icon={<Cpu className="size-5" />}
            eyebrow="Models"
            title="A model catalog, with keys kept in the platform"
            lead={
              <p>
                Platform admins add providers and publish their models to every team or to chosen teams. A template
                version picks a model; a team may choose another of its models for one agent.
              </p>
            }
            bullets={[
              <>
                <Strong>Providers:</Strong> OpenAI, Anthropic, and servers compatible with OpenAI chat completions, the
                OpenAI Responses API or the Anthropic Messages API. Discover models lists what a provider offers.
              </>,
              <>
                <Strong>Proxy mode</Strong> (the default): agents call the platform&apos;s gateway, which checks the
                model, adds the key and counts the tokens. Agents never see the key. Direct mode hands it to them.
              </>,
              <>
                <Strong>Team providers:</Strong> owners and admins can add their own, for their team alone, proxy only,
                at addresses the platform&apos;s guard allows.
              </>,
              <>Keys and extra headers are encrypted at rest and never returned.</>,
            ]}
          />

          {/* DESIGN.md "MCP servers", "Team MCP servers"; api/openapi.yaml (McpAttach, ClientMcpServer) */}
          <FeatureCard
            id="feature-mcp"
            icon={<Plug className="size-5" />}
            eyebrow="MCP servers"
            title="Tools from a catalog, down to the tool"
            lead={
              <p>
                Platform admins add remote MCP servers and publish them to teams; the platform reads and keeps each
                server&apos;s tool list. A template version gives its agents a server&apos;s tools, all of them or only
                some.
              </p>
            }
            bullets={[
              <>
                <Strong>Through the gateway</Strong> by default: it adds the server&apos;s headers, refuses tools the
                version left out, and logs every call.
              </>,
              <>
                <Strong>Team servers:</Strong> owners and admins add MCP servers for their team only, reached through the
                gateway and the same address guard.
              </>,
              <>
                <Strong>Apps&apos; own servers,</Strong> where a template allows it: a chat app can give one thread the
                MCP servers its user enabled, on hosts the operator allows. The platform keeps their headers.
              </>,
              <>
                <Strong>Who a call is for:</Strong> through the gateway, each request carries a short-lived token the
                platform signs, naming the agent, its team and, in a personal workspace or a private thread, the
                person. Servers verify it with the platform&apos;s published keys; the agent can&apos;t change it.
              </>,
              <>Tools an MCP App keeps for its own interface are never offered to the model.</>,
            ]}
          />

          {/* DESIGN.md "Threads"; api/openapi.yaml (AgentMessageCreate, admin thread routes) */}
          <FeatureCard
            id="feature-threads"
            icon={<MessageSquare className="size-5" />}
            eyebrow="Threads"
            title="Private or shared conversations, with authors"
            lead={
              <p>
                A conversation is a thread. Starting it makes it shared, seen by everyone who may use the agent, or
                private to the person or service account that started it.
              </p>
            }
            bullets={[
              <>
                <Strong>Private means private:</Strong> not the team&apos;s owners or admins either. Someone else&apos;s
                private thread reads as not found on every route.
              </>,
              <>
                <Strong>Authors set by the platform:</Strong> on shared team threads the agent is told who is speaking,
                and threads list who took part.
              </>,
              <>
                <Strong>Reasoned reads only:</Strong> platform admins can open a conversation by stating a reason; the
                read is in the team&apos;s audit log, where its owners see it.
              </>,
              <>
                <Strong>IDs nobody can guess:</Strong> an app asks the platform to start a thread and gets a random ID,
                and an app&apos;s own MCP servers attach only to a thread whose creator is known.
              </>,
              <>
                <Strong>Built for long conversations:</Strong> thread lists page and search by title, a conversation
                loads page by page, and its event stream can send only what changed: what it sends follows the new
                text, not the conversation&apos;s length.
              </>,
              <>
                <Strong>Steer a reply:</Strong> a message sent while the agent works can join the reply in progress
                instead of waiting for it. In the console&apos;s test chat, Enter queues a follow-up and Steer joins
                the reply.
              </>,
              <>Listing threads doesn&apos;t wake the agent; one event stream covers every agent a caller may use.</>,
            ]}
          />

          {/* docs/triggers.md; docs/approvals.md; web/src triggers-tab.tsx, runs-tab.tsx */}
          <FeatureCard
            id="feature-triggers"
            icon={<Network className="size-5" />}
            eyebrow="Triggers"
            title="Agents that run on their own"
            lead={
              <p>
                Schedules and webhooks start work without a person. Each fire wakes the agent and sends it a message as
                the trigger, never as someone, with the team&apos;s models and MCP servers.
              </p>
            }
            bullets={[
              <>
                <Strong>Schedules</Strong> in cron with a time zone, and <Strong>webhooks</Strong> your systems sign
                with a secret: an unsigned, altered or replayed delivery starts nothing.
              </>,
              <>
                <Strong>Runs</Strong> with their status and cost, in the console and the API, and a signed callback
                to your system when each one ends.
              </>,
              <>
                <Strong>Limits that hold:</Strong> runs at once, a maximum run time, daily budgets per trigger and per
                agent, pauses, and back-off that pauses a failing trigger.
              </>,
              <>
                <Strong>Reminders the agent sets itself,</Strong> where its template allows: listed with the
                agent&apos;s triggers, within the same limits, and never from someone&apos;s private conversation.
              </>,
              <>Only a team&apos;s owners and admins, in the console, create triggers: they spend with nobody present.</>,
            ]}
          />

          {/* docs/custom-agents.md; docs/runtime-contract.md; examples/custom-agent */}
          <FeatureCard
            id="feature-custom-agents"
            icon={<Layers className="size-5" />}
            eyebrow="Custom agents"
            title="The runtime is a library"
            lead={
              <p>
                The agent runtime is also a TypeScript library, and the platform&apos;s own assistant is its default
                composition. Build an agent with its own tools, state and guards, on the same storage, hibernation and
                access rules.
              </p>
            }
            bullets={[
              <>
                <Strong>Tools, documents and hooks</Strong> through a stable facade over the durable package; guards run
                on every turn of every thread.
              </>,
              <>
                <Strong>A test kit:</Strong> a scripted model, in-memory storage, crash-and-restart tests that check no
                tool call is repeated or lost, and the runtime contract as a conformance suite.
              </>,
              <>
                <Strong>State for apps:</Strong> tool details and documents an agent exposes, read through the platform
                with the thread&apos;s access rules, and an event when one changes.
              </>,
              <>
                <Strong>Upgrades are checked:</Strong> the platform refuses to start an agent on a runtime older than the
                one that last wrote its data, and says why.
              </>,
            ]}
            note={
              <>
                A custom agent goes into the runtime image the operator deploys, for the whole installation. Teams
                don&apos;t upload code; choosing a runtime per template is on the roadmap.
              </>
            }
          />

          {/* DESIGN.md "Models › Usage"; api/openapi.yaml (UsageReport, audit routes); web/src admin audit CSV export */}
          <FeatureCard
            id="feature-governance"
            icon={<Activity className="size-5" />}
            eyebrow="Usage and audit"
            title="Know what agents use, and who changed what"
            lead={
              <p>
                Model usage is counted for every request, through the proxy or reported by the runtime for models the
                proxy doesn&apos;t see, so nothing counts twice.
              </p>
            }
            bullets={[
              <>
                <Strong>Usage reports</Strong> for each team and for the platform: requests and tokens per day, model,
                agent, agent by day or team, with a cost estimate from the models&apos; prices. An app reads several
                agents&apos; usage in one call, and platform admins filter by the connected app it came through.
              </>,
              <>
                <Strong>An append-only audit log,</Strong> written in the same transaction as each change, for the
                platform (with CSV export) and for each team.
              </>,
              <>
                <Strong>Rate limits</Strong> counted in PostgreSQL; keys and tokens stored only as peppered
                digests; secrets sealed with AES-256-GCM; the key pepper and the encryption key can be rotated, and a <code>rekey</code> command re-seals every stored secret under the new encryption key.
              </>,
              <>
                <Strong>Metrics and traces:</Strong> Prometheus metrics on a port of its own (agent wakes, running
                agents, proxy traffic, errors, sign-ins, database pools), a Grafana dashboard and example alerts, and
                optional OpenTelemetry traces. Metric labels never name a person, team, agent or conversation, and
                traces carry no message content or credentials.
              </>,
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- For apps */

// DESIGN.md "OAuth Connect", steps 1 to 4, with the example hosts.
const connectSnippet = `PLATFORM=${host}

# 1. Discover the authorization server
curl $PLATFORM/.well-known/oauth-authorization-server

# 2. Send the person to sign in and allow your app
$PLATFORM/oauth/authorize?response_type=code
  &client_id=https://chat.example.com/oauth/client-metadata.json
  &redirect_uri=https://chat.example.com/connect/callback
  &code_challenge=...&code_challenge_method=S256
  &state=...&scope=agents

# 3. Exchange the code at POST /oauth/token for a pdpat_...
#    access token (1 hour) and a pdprt_... refresh token

# 4. Call the platform as that person
curl -H "Authorization: Bearer pdpat_..." \\
  $PLATFORM/v1/agents`;

function ForApps() {
  return (
    <section id="apps" aria-labelledby="apps-title" className="scroll-mt-16 border-t border-brand-border bg-brand-surface-sunken py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading id="apps-title" eyebrow="For app builders" title="Reach agents from your app, as the app or as the person">
          <p>
            The console&apos;s chat is for testing. People use agents through your apps, and your apps call the
            platform API.
            It is described in OpenAPI; replies stream as server-sent events, whole views or only the changes. A{" "}
            <code>requestId</code> makes a retried message safe, and an <code>Idempotency-Key</code> a retried agent
            creation. Your systems can also start an agent&apos;s work with a signed webhook, and read the state an
            agent exposes, such as a triage queue or a research plan.
          </p>
        </SectionHeading>
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary-subtle text-brand-primary-subtle-text">
                <Server className="size-5" />
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-brand-text">As the app: service account keys</h3>
            </div>
            <CheckList
              items={[
                <>
                  A team service account&apos;s key (<code>pdp_sa_…</code>) reaches the team&apos;s agents. With the
                  editor role, it can also create them.
                </>,
                <>
                  <code>PUT …/agents/by-key/&lt;your user ID&gt;</code> gives each user of your app an agent of their
                  own, created the first time and returned after that.
                </>,
                <>
                  Personal API keys (<code>pdp_…</code>) work too, acting as their person, for scripts.
                </>,
              ]}
            />
            <div className="mt-8 flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary-subtle text-brand-primary-subtle-text">
                <LogIn className="size-5" />
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-brand-text">As the person: OAuth Connect</h3>
            </div>
            <CheckList
              items={[
                <>
                  The platform is an OAuth 2.1 authorization server: PKCE is required, and an app identifies itself with
                  a Client ID Metadata Document or Dynamic Client Registration.
                </>,
                <>
                  The person signs in with the platform&apos;s usual sign-in and allows the app once. Platform admins can
                  mark apps as trusted, which skips the consent page, never the sign-in.
                </>,
                <>
                  The app&apos;s token reaches the person&apos;s personal workspace and their teams&apos; agents, without
                  their platform role: an app acting for an admin gets no admin powers. With the{" "}
                  <code>agents:read</code> scope it only reads.
                </>,
                <>
                  <code>prompt=none</code> reconnects silently, and <code>login_hint</code> names the account the app
                  expects: the platform never connects another one, and never tells an app the person hasn&apos;t
                  connected which account is signed in.
                </>,
                <>
                  An app can keep one agent per purpose in the person&apos;s personal workspace with the same{" "}
                  <code>PUT …/agents/by-key/…</code>; the agent is the person&apos;s.
                </>,
                <>
                  A trusted app, with a secret from a platform admin, follows everyone who connected it on one event
                  stream and reads their usage by person, named only by a pseudonymous ID for that app. People who
                  haven&apos;t connected it, and service accounts, appear without one. Taking the app off the trusted
                  list deletes its secrets.
                </>,
                <>
                  Refresh tokens rotate on every use; a stolen one, used again, ends the whole connection. People
                  disconnect apps under Account › Connected apps.
                </>,
              ]}
            />
          </div>
          <div className="min-w-0 space-y-4">
            <CodeBlock label="OAuth Connect: act as the person who connected your app">{connectSnippet}</CodeBlock>
            <p className="text-sm text-brand-muted">
              Tokens are stored only as digests, every request re-checks the person (a suspended person is refused), and
              the audit log records what an app does as the person, through the app.{" "}
              <TextLink href={site.oauthConnectUrl}>OAuth Connect in the design notes</TextLink>
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={site.openapiUrl} variant="secondary">
                The OpenAPI description
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Screenshots */

const gallery: SlotName[] = [
  "team-agents",
  "agent-test",
  "deploy-agent",
  "template-versions",
  "admin-models",
  "team-mcp-servers",
  "team-usage",
  "oauth-consent",
];

function Screenshots() {
  return (
    <section id="screenshots" aria-labelledby="screenshots-title" className="scroll-mt-16 border-t border-brand-border py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading id="screenshots-title" eyebrow="The web console" title="One console for teams and platform admins">
          <p>
            Teams deploy and test their agents, write templates, and manage their models, MCP servers, service accounts
            and usage. Platform admins review templates and configure models, MCP servers and settings; auditors see the
            same pages, read-only.
          </p>
        </SectionHeading>
        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {gallery.map((slot) => (
            <Screenshot key={slot} slot={slot} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Self-host */

// README.md "Quick start (development)".
const quickStart = `git clone https://github.com/ncecere/pi-durable-platform.git
cd pi-durable-platform
make deps-up                   # PostgreSQL 17, local only
(cd runtime && pnpm install)   # the agent runtime
make web                       # build the web UI
make run                       # http://localhost:8098`;

// deploy/helm/pi-durable-platform/README.md (Install) and
// .github/workflows/chart.yml: the chart is published to ghcr.io/ncecere/charts
// and signed with cosign (keyless) at the release tag.
const digestOrPlaceholder = (d: string | null) => d ?? "sha256:<digest from the release notes>";
const helmInstall = `# values.yaml: appUrl, oidc, ingress and networkPolicy (your API server's
# address and your PostgreSQL pods). Secrets are created beforehand.
helm install pi-durable-platform ${site.chart.oci} \\
  --version ${site.chart.version} -n pi-durable-platform -f values.yaml \\
  --set images.platform.digest=${digestOrPlaceholder(site.images.platformDigest)} \\
  --set images.runtime.digest=${digestOrPlaceholder(site.images.runtimeDigest)}

# Verify the chart's signature (cosign v3.0 or newer; keyless)${site.chart.digest ? `
# Chart ${site.chart.version} is ${site.chart.digest}` : ""}
cosign verify ${site.chart.image}:${site.chart.version} \\
  --certificate-identity \\
    ${site.chart.certificateIdentity} \\
  --certificate-oidc-issuer \\
    ${site.images.oidcIssuer}`;

// .env.example and DESIGN.md "Launchers"; internal/config/validate.go.
const warmPool = `AGENTS_LAUNCHER=agent-sandbox
AGENTS_SANDBOX_WARM_POOL=agent-runtimes     # your SandboxWarmPool
AGENTS_SANDBOX_ACTIVATION_SECRET=agent-activation
AGENTS_GATEWAY_URL=http://<platform service>:<gateway port>
AGENTS_IDLE_TIMEOUT=10m`;

// .github/workflows/image.yml and scripts/github-release.sh: both images are
// multi-arch, signed with cosign keyless signing at the tag, and their
// digests are in the release notes.
const platformImage = imageRef(site.images.platform, site.images.platformDigest);
const runtimeImage = imageRef(site.images.runtime, site.images.runtimeDigest);
const releaseImages = `docker pull ${platformImage}
docker pull ${runtimeImage}

# Verify each signature (cosign v3.0 or newer; keyless)
REPO=${site.repoUrl}
cosign verify ${platformImage} \\
  --certificate-identity \\
    "$REPO${site.images.certificateIdentity.slice(site.repoUrl.length)}" \\
  --certificate-oidc-issuer \\
    ${site.images.oidcIssuer}`;

const launchers: { name: string; runtime: string; idle: string }[] = [
  { name: "kubernetes", runtime: "A pod per agent", idle: "Delete the pod" },
  { name: "agent-sandbox", runtime: "A Sandbox per agent around the same pod", idle: "Suspend the Sandbox" },
  { name: "agent-sandbox + warm pool", runtime: "A standby runtime claimed from a warm pool", idle: "Release the claim" },
  { name: "local", runtime: "A child process (development)", idle: "Stop the process" },
];

const requirements = [
  "PostgreSQL 17: one database for the platform, and one for agents' state, reached by a role that may create roles",
  "An OpenID Connect identity provider for sign-in",
  "Kubernetes 1.27 or newer for agent runtimes, with a network plugin that enforces NetworkPolicy, and Helm 3 or 4 for the chart. Agent Sandbox for the sandbox and warm-pool launchers",
  "TLS in front of the platform, on the host in APP_URL",
  "Two 32-byte secrets, ENCRYPTION_KEY and API_KEY_PEPPER, kept with your backups",
];

function SelfHost() {
  return (
    <section id="self-host" aria-labelledby="self-host-title" className="scroll-mt-16 border-t border-brand-border bg-brand-surface-sunken py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading id="self-host-title" eyebrow="Self-host" title="Run it on your own infrastructure">
          <p>
            {site.name} is one Go binary with the web UI built in, in a distroless image that runs as non-root with a
            read-only root filesystem. Agents run the runtime image, one per active agent, started by the launcher you
            choose. On Kubernetes you install it with a signed <Strong>Helm chart</Strong>, or with Kustomize resources
            generated from it.
          </p>
          <p>
            With <TextLink href={site.agentSandboxUrl}>Agent Sandbox</TextLink>&apos;s warm pool, standby runtimes are
            already started: waking an agent claims one and activates it as that agent, skipping scheduling, image pull
            and start-up.
          </p>
        </SectionHeading>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="min-w-0 space-y-6">
            <CodeBlock label="Install on Kubernetes with the Helm chart">{helmInstall}</CodeBlock>
            <p className="text-sm text-brand-muted">
              The chart deploys the platform, the namespace agents run in, the platform&apos;s permissions there (a
              Role in that namespace only, nothing cluster-wide) and the NetworkPolicies that isolate agents. The{" "}
              <TextLink href={site.kustomizeDocsUrl}>Kustomize</TextLink> base and its overlays for each launcher have
              the same objects, and a check keeps the two in step. It doesn&apos;t install PostgreSQL, your ingress
              controller or Agent Sandbox.
            </p>
            <CodeBlock label="Try Pi Durable Platform on your machine">{quickStart}</CodeBlock>
            <ol className="list-decimal space-y-3 pl-5 text-brand-muted marker:text-brand-subtle">
              <li>
                Needs Go 1.26, Node 22.19, pnpm 11 and Docker. Sign in as <Strong>Dev Platform Admin</Strong> and create
                a team under <Strong>Admin › Teams</Strong>.
              </li>
              <li>
                Open the team&apos;s <Strong>Agents</Strong>, deploy one and use its <Strong>Test</Strong> tab. Agents run
                as local processes, on a scripted demo model until you add a real one.
              </li>
            </ol>
            <Note>
              Development sign-in and the example keys work only on a loopback address; the platform refuses to start
              with them anywhere else. Never expose them.
            </Note>
            <CodeBlock label={`The ${site.version} release images: the platform and the agent runtime`}>{releaseImages}</CodeBlock>
            <p className="text-sm text-brand-muted">
              Both are built for linux/amd64 and linux/arm64, with SBOMs, and signed at the release tag. The{" "}
              <TextLink href={site.releaseNotesUrl}>release notes</TextLink> list their digests: pin those in your
              deployment.
            </p>
            <CodeBlock label="Agent Sandbox with a warm pool (excerpt of the platform's settings)">{warmPool}</CodeBlock>
            <p className="text-sm text-brand-muted">
              With the chart, set <code>agents.launcher: agent-sandbox</code>: it creates the warm pool (its size is{" "}
              <code>agentSandbox.warmPool.size</code>) and the activation Secret is kept by the platform.
            </p>
            <div className="min-w-0 overflow-x-auto rounded-card border border-brand-border-emphasis bg-brand-surface">
              <table className="w-full text-left text-sm">
                <caption className="border-b border-brand-border px-4 py-2 text-left text-xs font-medium text-brand-muted">
                  Launchers (AGENTS_LAUNCHER): where an active agent runs, and what hibernating does
                </caption>
                <thead>
                  <tr className="border-b border-brand-border text-xs text-brand-subtle">
                    <th scope="col" className="py-2 pr-3 pl-4 font-medium">Launcher</th>
                    <th scope="col" className="px-3 py-2 font-medium">Runtime per active agent</th>
                    <th scope="col" className="py-2 pr-4 pl-3 font-medium">Hibernate</th>
                  </tr>
                </thead>
                <tbody>
                  {launchers.map((l) => (
                    <tr key={l.name} className="border-b border-brand-border last:border-0">
                      <th scope="row" className="py-2 pr-3 pl-4 align-top font-mono text-xs font-normal text-brand-text sm:text-[0.8125rem]">
                        {l.name}
                      </th>
                      <td className="px-3 py-2 align-top text-brand-muted">{l.runtime}</td>
                      <td className="py-2 pr-4 pl-3 align-top text-brand-muted">{l.idle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="self-start rounded-card border border-brand-border bg-brand-surface p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-brand-text">What you need</h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-muted">
              {requirements.map((r) => (
                <li key={r} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-text" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-lg font-semibold text-brand-text">On Kubernetes</h3>
            <p className="mt-2 text-sm text-brand-muted">
              Agent pods get no service account token, a restricted security context and a read-only root filesystem,
              and can use a sandboxing RuntimeClass such as gVisor. Secrets reach them through a Secret per agent, never
              the pod spec. The platform manages pods and Secrets (or sandboxes and claims) in the agents&apos;
              namespace only; <code>/healthz</code> and <code>/readyz</code> serve the probes.
            </p>
            <Note>
              The chart&apos;s NetworkPolicies deny everything in the agents namespace: an agent takes traffic from the
              platform only, and reaches only its database, the platform&apos;s gateway and DNS. They need a network
              plugin that enforces NetworkPolicy, and the repository&apos;s smoke test installs the chart into a kind
              cluster and checks that agents really are isolated. The platform runs as one replica or as two, and its
              metrics port (no authentication) can be reached only by the scraper you name. Every setting is
              listed in <TextLink href={site.envExampleUrl}>.env.example</TextLink>, and the launchers are in the{" "}
              <TextLink href={site.launchersUrl}>design notes</TextLink>.
            </Note>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={site.installDocsUrl}>
                Install on Kubernetes
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href={site.docsUrl} variant="secondary">
                Self-hosting docs
              </ButtonLink>
              <ButtonLink href={site.deployUrl} variant="secondary">
                Chart and manifests on GitHub
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Open source */

function OpenSource() {
  return (
    <section id="open-source" aria-labelledby="open-source-title" className="scroll-mt-16 border-t border-brand-border py-20 sm:py-24">
      <div className="container-page">
        <h2 id="open-source-title" className="sr-only">
          Open source and project status
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <article aria-labelledby="oss-title" className="min-w-0 rounded-card border border-brand-border bg-brand-surface p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary-subtle text-brand-primary-subtle-text">
                <Github className="size-5" />
              </span>
              <Eyebrow>Open source</Eyebrow>
            </div>
            <h3 id="oss-title" className="mt-3 text-2xl font-semibold tracking-tight text-brand-text">
              MIT licensed, built in the open
            </h3>
            <div className="mt-4 space-y-3 leading-relaxed text-brand-muted">
              <p>
                {site.name} is released under the MIT licence. Run it for as many people as you like, and change the
                code if you need to.
              </p>
              <p>
                The platform is written in Go with PostgreSQL and a React web UI built into the binary; the agent runtime
                is TypeScript. The API is described in OpenAPI, and a test fails if the served routes and the description
                differ. Integration tests run against real PostgreSQL, and an authorization matrix covers every operation.
              </p>
              <p>
                It is an independent project. Agents are built with <TextLink href={site.piUrl}>Pi</TextLink>&apos;s
                durable package, which has its own authors and licence; {site.shortName} isn&apos;t affiliated with or
                endorsed by Earendil, which makes Pi, and uses none of Pi&apos;s logos.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={site.repoUrl} variant="secondary">
                <Github className="size-4" />
                Source on GitHub
              </ButtonLink>
              <ButtonLink href={site.licenseUrl} variant="ghost">
                Read the licence
              </ButtonLink>
            </div>
          </article>
          <article
            id="status"
            aria-labelledby="status-title"
            className="min-w-0 scroll-mt-20 rounded-card border border-brand-border bg-brand-surface p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-primary-subtle text-brand-primary-subtle-text">
                <Layers className="size-5" />
              </span>
              <Eyebrow>Project status</Eyebrow>
            </div>
            <h3 id="status-title" className="mt-3 text-2xl font-semibold tracking-tight text-brand-text">
              {site.version}, agents that run on their own
            </h3>
            <div className="mt-4 space-y-3 leading-relaxed text-brand-muted">
              <p>
                {site.version} lets agents work without a person: schedules and signed webhooks that start runs, with
                limits, budgets and a signed callback when each run ends, and reminders an agent sets itself. A person
                can approve sensitive tool calls before they run, MCP servers learn which person a call is for from a
                token the platform signs, and hibernation knows about background work. The runtime is now a library
                with a test kit, so operators can build agents with their own tools, state and guards, and two agents
                built with it ship as template kinds: triage and a deep researcher. It builds on v0.3.0 and adds six
                database migrations and settings for background work and triggers.
              </p>
              <p>
                v0.3.0, the release before, was for apps at scale: paging and search, event streams that send only
                what changed, steering, safe retries, moving agents and OAuth Connect for apps with many people. Every
                setting is in <TextLink href={site.envExampleUrl}>.env.example</TextLink>.
              </p>
              <p>
                Everything on this page is built and tested, but it is before 1.0 and hasn&apos;t run in production
                beyond its maintainer&apos;s own installation: expect changes between releases, and read the release
                notes before you upgrade. The durable package is experimental itself, so the runtime pins one version
                of it and its conformance suite guards every upgrade.
              </p>
              <p>
                <Strong>Planned, not built yet</Strong>, in the order of the{" "}
                <TextLink href={site.roadmapUrl}>roadmap</TextLink>:
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm marker:text-brand-subtle">
                <li>
                  <Strong>v0.5, files, memory and limits:</Strong> files and images on object storage, runtime
                  resources per template version, enforcing monthly cost budgets (recorded today), limits for shared
                  teams, memory for assistants (an MCP server that remembers for each person), showing MCP
                  servers&apos; app interfaces in the console and in apps, and agent runtimes that platform admins
                  register and template versions choose.
                </li>
                <li>
                  <Strong>v0.6, coding agents:</Strong> workspaces with files and a shell, kept apart from the
                  agent&apos;s credentials.
                </li>
                <li>
                  <Strong>Later:</Strong> running without Kubernetes, and stronger sandboxing (gVisor or Kata) before
                  teams upload agents of their own.
                </li>
              </ul>
              <p>
                <Strong>Known limits:</Strong> a custom agent is built into the runtime image for the whole
                installation, since teams can&apos;t upload code; budgets hold for triggered runs only, and a
                run&apos;s cost counts all of its agent&apos;s usage while it ran; webhook senders must sign the
                platform&apos;s way, or go through a relay that re-signs; tool approvals are one decision per call;
                the MCP identity token trusts the runtime to say which of its own agent&apos;s threads a call belongs
                to; several replicas need the Kubernetes or Agent Sandbox launcher, since the local one is a single
                process; traces stop at the agent&apos;s runtime, which doesn&apos;t continue them yet; group
                re-checks can&apos;t check people whose identity provider issued no refresh token; a schema per agent
                suits thousands of agents, not millions; agents share the database server&apos;s connections and
                CPU, which is acceptable for code the operator deploys, not for uploaded code; an app that chooses its
                own thread IDs should make them random, or ask the platform for them; and usage per connected app
                counts an agent&apos;s requests only when it is clear which app they serve.
              </p>
            </div>
            <p className="mt-6 text-brand-muted">
              Read the <TextLink href={site.releaseNotesUrl}>{site.version} release notes</TextLink>, the{" "}
              <TextLink href={site.roadmapUrl}>roadmap</TextLink> and its{" "}
              <TextLink href={site.roadmapIssuesUrl}>issues labelled roadmap</TextLink>, and the{" "}
              <TextLink href={site.statusUrl}>known limits and open items</TextLink> in the design notes.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
