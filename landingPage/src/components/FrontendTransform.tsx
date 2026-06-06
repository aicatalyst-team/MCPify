import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FrontendTransform() {
  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="px-4 py-2 text-xs font-mono text-muted-foreground border-b border-border bg-[oklch(0.2_0.015_60)] text-[oklch(0.95_0.01_80)]">
          CheckoutButton.tsx
        </div>
        <pre className="p-5 font-mono text-sm leading-relaxed bg-[oklch(0.16_0.015_60)] text-[oklch(0.95_0.01_80)]">
{`<button
  onClick={checkout}
  className="btn-primary"
>
  Complete Purchase
</button>`}
        </pre>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full glass flex items-center justify-center shadow-glow">
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl overflow-hidden shadow-glow"
      >
        <div className="px-4 py-2 text-xs font-mono text-primary border-b border-border bg-[oklch(0.2_0.015_60)] text-[oklch(0.95_0.01_80)]">
          mcp.tool.generated.ts
        </div>
        <pre className="p-5 font-mono text-sm leading-relaxed bg-[oklch(0.16_0.015_60)] text-[oklch(0.95_0.01_80)]">
{`mcp.action("checkoutCart", {
  surface: "frontend",
  selector: "[data-checkout]",
  preconditions: ["cart.hasItems"],
  perform: () => ui.click("checkout")
});`}
        </pre>
      </motion.div>
    </div>
  );
}
