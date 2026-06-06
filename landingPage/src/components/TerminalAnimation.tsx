import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const lines = [
  { text: "$ npx mcpify", delay: 0 },
  { text: "→ Scanning backend routes...", delay: 800 },
  { text: "→ Detecting workflows...", delay: 1600 },
  { text: "→ Extracting frontend actions...", delay: 2400 },
  { text: "→ Generating MCP server...", delay: 3200 },
  { text: "→ Applying safety rules...", delay: 4000 },
  { text: "", delay: 4400 },
  { text: "✓ checkoutCart()", delay: 4800, glow: true },
  { text: "✓ refundOrder()", delay: 5100, glow: true },
  { text: "✓ createSupportTicket()", delay: 5400, glow: true },
  { text: "✓ purchaseWorkflow()", delay: 5700, glow: true },
  { text: "", delay: 6000 },
  { text: "AI system generated successfully.", delay: 6200, success: true },
];

export function TerminalAnimation({ compact = false }: { compact?: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => (v >= lines.length ? 0 : v + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`glass rounded-xl overflow-hidden shadow-glow ${compact ? "" : "max-w-2xl"}`}
      style={{ boxShadow: "var(--shadow-glow), var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[oklch(0.2_0.015_60)] text-[oklch(0.78_0.02_80)]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[oklch(0.65_0.24_25)]" />
          <span className="w-3 h-3 rounded-full bg-[oklch(0.8_0.18_85)]" />
          <span className="w-3 h-3 rounded-full bg-[oklch(0.72_0.18_150)]" />
        </div>
        <span className="text-xs font-mono ml-2">~/project — mcpify</span>
      </div>
      <div className="p-5 font-mono text-sm min-h-[360px] bg-[oklch(0.16_0.015_60)] text-[oklch(0.85_0.01_80)]">
        {lines.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={
              line.success
                ? "text-[oklch(0.82_0.16_305)] font-semibold mt-1"
                : line.glow
                  ? "text-[oklch(0.9_0.18_130)]"
                  : line.text.startsWith("$")
                    ? "text-[oklch(0.92_0.14_70)]"
                    : "text-[oklch(0.88_0.08_180)]"
            }
          >
            {line.text || "\u00A0"}
          </motion.div>
        ))}
        {visible < lines.length && (
          <span className="inline-block w-2 h-4 bg-[oklch(0.88_0.21_130)] animate-blink align-middle" />
        )}
      </div>
    </div>
  );
}
