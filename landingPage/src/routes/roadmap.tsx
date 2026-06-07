import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, ArrowLeft } from "lucide-react";
import mcpifyLogo from "@/assets/logo.png";
import { Navbar } from "@/components/Navbar";

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
  { phase: "Phase 03", title: "Frontend Action Extraction", status: "Shipped" },
  { phase: "Phase 04", title: "Workflow Engine", status: "Shipped" },
  { phase: "Phase 05", title: "Permissions Layer", status: "Shipped" },
  { phase: "Phase 06", title: "Knowledge Graph", status: "Shipped" },
  { phase: "Phase 07", title: "AI Simulations", status: "Shipped" },
];

const TOON_TINTS = [
  "oklch(0.88 0.21 130)", // lime
  "oklch(0.74 0.17 5)",   // pink
  "oklch(0.72 0.16 305)", // purple
  "oklch(0.78 0.15 50)",  // peach
  "oklch(0.84 0.17 70)",  // yellow
  "oklch(0.88 0.09 180)", // mint
];

function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <div className="absolute inset-0 grid-bg pointer-events-none z-0" />
      <Navbar />
      <div className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(0.99_0_0)] border-[3px] border-foreground shadow-[2px_2px_0_0_#000] text-xs font-mono uppercase tracking-widest text-primary mb-4">
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

          <div className="relative mt-16 mb-24">
            <div className="absolute left-3.5 md:left-1/2 top-0 bottom-0 w-[4px] -translate-x-[2px] bg-foreground/15 rounded-full" />
            <div className="space-y-10">
              {roadmap.map((r, i) => {
                const tint = TOON_TINTS[i % TOON_TINTS.length];
                return (
                  <motion.div
                    key={r.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-12 ${
                      i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
                    }`}
                  >
                    <div className={`md:text-right ${i % 2 === 0 ? "" : "md:text-left"}`}>
                      <div className="bg-[oklch(0.99_0_0)] border-[3px] border-foreground rounded-2xl p-5 shadow-[5px_5px_0_0_#000] inline-block w-full max-w-sm hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#000] transition-all">
                        <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border-[2px] border-foreground w-fit mb-3 inline-block" style={{ backgroundColor: tint }}>
                          {r.phase}
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground mb-3">{r.title}</h3>
                        <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-mono border-[2px] border-foreground font-bold shadow-[1.5px_1.5px_0_0_#000] ${
                          r.status === "Shipped"
                            ? "bg-[oklch(0.88_0.21_130)] text-foreground"
                            : r.status === "Beta"
                              ? "bg-[oklch(0.72_0.16_305)] text-white"
                              : "bg-[oklch(0.96_0.02_90)] text-muted-foreground"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block" />
                    <span 
                      className="absolute left-1.5 md:left-1/2 top-7 -translate-x-[6px] w-[15px] h-[15px] rounded-full border-[3px] border-foreground shadow-[1.5px_1.5px_0_0_#000] transition-transform duration-300 hover:scale-125"
                      style={{ backgroundColor: tint }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-border flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-foreground transition-colors font-medium"
            >
              Suggest a feature
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
