import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, ArrowLeft } from "lucide-react";
import mcpifyLogo from "@/assets/logo.png";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — MCPify" },
      {
        name: "description",
        content: "MCPify product roadmap. See what we've shipped, what's in beta, and what's coming next.",
      },
      { property: "og:title", content: "Roadmap — MCPify" },
      {
        property: "og:description",
        content: "MCPify product roadmap. See what we've shipped, what's in beta, and what's coming next.",
      },
    ],
  }),
  component: RoadmapPage,
});

const roadmap = [
  { phase: "Phase 01", title: "Backend → MCP", status: "Shipped" },
  { phase: "Phase 02", title: "OpenAPI Support", status: "Shipped" },
  { phase: "Phase 03", title: "Frontend Action Extraction", status: "Beta" },
  { phase: "Phase 04", title: "Workflow Engine", status: "Beta" },
  { phase: "Phase 05", title: "Permissions Layer", status: "In Progress" },
  { phase: "Phase 06", title: "Knowledge Graph", status: "Planned" },
  { phase: "Phase 07", title: "AI Simulations", status: "Planned" },
];

function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <RoadmapNav />
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
              Roadmap
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight">
              <span className="gradient-text">What we&apos;re building next.</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              A transparent look at what&apos;s shipped, what&apos;s in beta, and what&apos;s on the horizon.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--primary)] to-transparent" />
            <div className="space-y-6">
              {roadmap.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-12 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}
                >
                  <div className={`md:text-right ${i % 2 === 0 ? "" : "md:text-left"}`}>
                    <div className="glass rounded-xl p-5 inline-block max-w-sm">
                      <div className="text-xs font-mono text-primary mb-1">{r.phase}</div>
                      <h3 className="font-display font-semibold text-lg">{r.title}</h3>
                      <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-mono ${
                        r.status === "Shipped"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : r.status === "Beta"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block" />
                  <span className="absolute left-1.5 md:left-1/2 top-6 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-glow" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-border flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-foreground transition-colors"
            >
              Suggest a feature
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function RoadmapNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="glass rounded-full px-5 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={mcpifyLogo}
              alt="MCPify"
              className="h-9 w-auto"
              style={{ filter: "drop-shadow(2px 2px 0 oklch(0.18 0.04 285))" }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/" hash="how" className="hover:text-foreground transition-colors">How it works</Link>
            <Link to="/" hash="features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link to="/roadmap" className="text-foreground transition-colors">Roadmap</Link>
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
