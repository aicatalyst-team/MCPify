import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Github, Book, Terminal, Shield, Workflow, Zap, Code, Database, Network } from "lucide-react";
import mcpifyLogo from "@/assets/mcpify-logo.png.asset.json";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Developer Docs — MCPify" },
      {
        name: "description",
        content:
          "MCPify developer documentation. Quick start, CLI reference, frontend extraction, workflows, permissions, and API reference.",
      },
      { property: "og:title", content: "Developer Docs — MCPify" },
      {
        property: "og:description",
        content: "Everything you need to compile your software into an AI-operable MCP server.",
      },
    ],
  }),
  component: DocsPage,
});

type DocItem = {
  id: string;
  title: string;
  group: string;
  icon: typeof Book;
  body: { kind: "p" | "code" | "h" | "list"; text?: string; items?: string[] }[];
};

const docs: DocItem[] = [
  {
    id: "quick-start",
    group: "Get Started",
    icon: Zap,
    title: "Quick Start",
    body: [
      { kind: "p", text: "Get your application compiled into an AI-operable MCP server in under a minute." },
      { kind: "h", text: "1. Install the CLI" },
      { kind: "code", text: "$ npx mcpify init" },
      { kind: "p", text: "MCPify will scan your repo, infer your framework, and generate a fully-typed MCP server in ./.mcp." },
      { kind: "h", text: "2. Serve locally" },
      { kind: "code", text: "$ npx mcpify serve --port 7331" },
      { kind: "p", text: "Connect any MCP-compatible agent runtime (Claude, GPT, custom) to http://localhost:7331." },
    ],
  },
  {
    id: "installation",
    group: "Get Started",
    icon: Book,
    title: "Installation",
    body: [
      { kind: "p", text: "MCPify ships as a single CLI binary with zero runtime dependencies on your app." },
      { kind: "code", text: "$ npm i -g mcpify\n$ mcpify --version" },
      { kind: "p", text: "Supported runtimes: Node 18+, Bun 1+, Deno 1.40+." },
    ],
  },
  {
    id: "cli",
    group: "Get Started",
    icon: Terminal,
    title: "CLI Commands",
    body: [
      { kind: "h", text: "Common commands" },
      { kind: "list", items: [
        "mcpify init — bootstrap an .mcp directory",
        "mcpify scan — re-analyze your codebase",
        "mcpify serve — run the MCP server locally",
        "mcpify deploy — push to MCPify Cloud",
        "mcpify simulate — run AI agents against your app",
      ]},
      { kind: "code", text: "$ mcpify scan --watch" },
    ],
  },
  {
    id: "backend",
    group: "Core",
    icon: Code,
    title: "Backend Scanning",
    body: [
      { kind: "p", text: "MCPify performs deep AST analysis of routes, controllers, and services across Express, Fastify, NestJS, FastAPI, Django, Rails, and more." },
      { kind: "p", text: "Every callable action is surfaced with typed inputs, outputs, and inferred side-effects." },
    ],
  },
  {
    id: "frontend",
    group: "Core",
    icon: Network,
    title: "Frontend Extraction",
    body: [
      { kind: "p", text: "React, Vue, and Svelte components are parsed for user-driven actions: button clicks, form submissions, navigations." },
      { kind: "p", text: "Agents can operate your UI like a human — click, type, navigate — without brittle DOM selectors." },
    ],
  },
  {
    id: "openapi",
    group: "Core",
    icon: Database,
    title: "OpenAPI Support",
    body: [
      { kind: "p", text: "Drop in any OpenAPI 3.x spec and get a typed MCP server in seconds." },
      { kind: "code", text: "$ mcpify import ./openapi.yaml" },
    ],
  },
  {
    id: "workflows",
    group: "Core",
    icon: Workflow,
    title: "Workflows",
    body: [
      { kind: "p", text: "Multi-step processes are detected and exposed as atomic agent capabilities, with built-in state management." },
    ],
  },
  {
    id: "security",
    group: "Safety",
    icon: Shield,
    title: "Security",
    body: [
      { kind: "p", text: "Every action runs through a sandboxed permission layer. Audit logs are emitted for every agent invocation." },
    ],
  },
  {
    id: "permissions",
    group: "Safety",
    icon: Shield,
    title: "Permissions",
    body: [
      { kind: "p", text: "Scopes, roles, and rate limits are enforced at the tool boundary — agents can never bypass them." },
      { kind: "code", text: "permissions:\n  refundOrder:\n    scopes: [admin]\n    rateLimit: 10/hour" },
    ],
  },
  {
    id: "api",
    group: "Reference",
    icon: Book,
    title: "API Reference",
    body: [
      { kind: "p", text: "The MCPify runtime exposes a typed JSON-RPC API conforming to the MCP specification." },
    ],
  },
  {
    id: "examples",
    group: "Reference",
    icon: Code,
    title: "Examples",
    body: [
      { kind: "list", items: [
        "examples/express-shop — e-commerce backend",
        "examples/nextjs-saas — full-stack SaaS",
        "examples/fastapi-crm — Python CRM",
        "examples/openapi-stripe — Stripe API wrapped as MCP",
      ]},
    ],
  },
];

const groupOrder = ["Get Started", "Core", "Safety", "Reference"];

function DocsPage() {
  const [activeId, setActiveId] = useState("quick-start");
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? docs.filter((d) => d.title.toLowerCase().includes(q) || d.group.toLowerCase().includes(q))
      : docs;
    return groupOrder
      .map((g) => ({ group: g, items: filtered.filter((d) => d.group === g) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  const active = docs.find((d) => d.id === activeId) ?? docs[0];

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <DocsNav />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono uppercase tracking-widest text-primary mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Developer Docs
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight">
              <span className="gradient-text">Build with MCPify.</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Searchable, opinionated, and complete. Every concept comes with a runnable example.
            </p>
          </motion.div>

          <div className="glass rounded-2xl overflow-hidden grid md:grid-cols-[260px_1fr] min-h-[600px]">
            <aside className="border-r border-border bg-[oklch(0.22_0.015_60)] text-[oklch(0.95_0.01_80)] p-4 md:max-h-[80vh] md:overflow-y-auto">
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 rounded-md bg-[oklch(0.16_0.015_60)] text-[oklch(0.95_0.01_80)] border border-border text-xs font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  placeholder="Search docs..."
                />
              </div>
              {grouped.map((s) => (
                <div key={s.group} className="mb-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 px-2">
                    {s.group}
                  </div>
                  {s.items.map((item) => {
                    const isActive = item.id === activeId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveId(item.id)}
                        className={`w-full text-left block px-2 py-1.5 rounded text-sm transition-colors ${
                          isActive
                            ? "bg-primary/15 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              ))}
              {grouped.length === 0 && (
                <div className="px-2 text-xs text-muted-foreground">No matches.</div>
              )}
            </aside>

            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10"
            >
              <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">
                {active.group}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <active.icon className="w-7 h-7 text-primary" />
                <h2 className="text-3xl md:text-4xl font-display font-semibold">{active.title}</h2>
              </div>

              <div className="space-y-5">
                {active.body.map((block, i) => {
                  if (block.kind === "p") {
                    return (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {block.text}
                      </p>
                    );
                  }
                  if (block.kind === "h") {
                    return (
                      <h3 key={i} className="text-lg font-display font-semibold mt-6">
                        {block.text}
                      </h3>
                    );
                  }
                  if (block.kind === "code") {
                    return (
                      <pre
                        key={i}
                        className="bg-[oklch(0.16_0.015_60)] text-[oklch(0.95_0.01_80)] border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto whitespace-pre"
                      >
                        {block.text}
                      </pre>
                    );
                  }
                  if (block.kind === "list" && block.items) {
                    return (
                      <ul key={i} className="space-y-2">
                        {block.items.map((it) => (
                          <li key={it} className="flex gap-3 text-sm text-muted-foreground">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to home
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-foreground transition-colors"
                >
                  Edit on GitHub <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DocsNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="glass rounded-full px-5 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={mcpifyLogo.url}
              alt="MCPify"
              className="h-9 w-auto"
              style={{ filter: "drop-shadow(2px 2px 0 oklch(0.18 0.04 285))" }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/" hash="how" className="hover:text-foreground transition-colors">How it works</Link>
            <Link to="/" hash="features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/docs" className="text-foreground transition-colors">Docs</Link>
            <Link to="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="font-mono">12.4k</span>
            </a>
            <Link
              to="/"
              hash="cta"
              className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
