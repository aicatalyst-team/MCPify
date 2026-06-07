import { motion } from "framer-motion";
import { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  centered = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <section id={id} className={`relative py-28 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {(eyebrow || title || description) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`max-w-3xl mb-16 ${centered ? "mx-auto text-center" : ""}`}
          >
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono uppercase tracking-widest text-primary mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-[1.05]">
                <span className="gradient-text">{title}</span>
              </h2>
            )}
            {description && (
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{description}</p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
