import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Code2, Cpu, Database, GitBranch, Layers, Shield, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PacketRail } from "./pipeline/PacketRail";
import { StageSkeleton } from "./pipeline/StageSkeleton";

const OUTLINE = "oklch(0.14 0.03 285)";

const stages = [
  { icon: Layers, title: "Application", desc: "Your existing app, APIs, frontends, and databases — exactly as they are today." },
  { icon: Code2, title: "Static Analysis", desc: "AST parsing across the full stack to map every surface, route, and call site." },
  { icon: Sparkles, title: "Semantic Understanding", desc: "LLM-driven intent extraction turns code into meaning agents can reason about." },
  { icon: GitBranch, title: "Workflow Extraction", desc: "Multi-step user flows discovered and composed into reusable operations." },
  { icon: Shield, title: "Safety Layer", desc: "Permissions, scopes, and audit hooks wrapped around every callable action." },
  { icon: Cpu, title: "MCP Generation", desc: "Type-safe, callable MCP tools generated from your real application surface." },
  { icon: Database, title: "AI-Operable System", desc: "Agents drive your software with the same guarantees as a human user." },
];

const AUTO_MS = 2400;

export function Pipeline() {
  const [active, setActive] = useState(0);
  const pausedUntil = useRef(0);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      if (hovered || Date.now() < pausedUntil.current) return;
      setActive((i) => (i + 1) % stages.length);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [hovered, reduceMotion]);

  const select = (i: number) => {
    setActive(i);
    pausedUntil.current = Date.now() + 5000;
  };

  const current = stages[active];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="space-y-10"
    >
      <PacketRail stages={stages} activeIndex={active} onSelect={select} />

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* Detail text */}
        <div
          className="relative p-6 min-h-[200px]"
          style={{
            background: "oklch(0.99 0 0)",
            border: `3px solid ${OUTLINE}`,
            borderRadius: "1.5rem",
            boxShadow: `6px 6px 0 0 ${OUTLINE}`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-mono px-2 py-0.5"
                  style={{
                    background: "oklch(0.96 0 0)",
                    border: `2px solid ${OUTLINE}`,
                    borderRadius: 6,
                    color: OUTLINE,
                  }}
                >
                  Stage 0{active + 1} / 07
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold" style={{ color: OUTLINE }}>
                {current.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 285)" }}>
                {current.desc}
              </p>

              {/* Progress dots */}
              <div className="flex gap-1.5 mt-6">
                {stages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => select(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === active ? 24 : 8,
                      background: i === active ? OUTLINE : "oklch(0.85 0 0)",
                    }}
                    aria-label={`Go to stage ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skeleton */}
        <div className="min-h-[200px] aspect-[4/3] md:aspect-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <StageSkeleton index={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
