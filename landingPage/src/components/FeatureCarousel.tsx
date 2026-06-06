import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { ToonIcon } from "./ToonIcon";

export type Feature = {
  icon?: LucideIcon;
  title: string;
  desc: string;
  tint?: string;
};

export function FeatureCarousel({ features }: { features: Feature[] }) {
  const [index, setIndex] = useState(0);
  const total = features.length;

  const go = (next: number) => setIndex(((next % total) + total) % total);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > threshold || info.velocity.x > 400) go(index - 1);
  };

  // signed shortest distance between i and index, supports wrap-around
  const distance = (i: number) => {
    let d = i - index;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  return (
    <div className="relative select-none">
      <div className="relative h-[340px] flex items-center justify-center [perspective:1200px]">
        {features.map((f, i) => {
          const d = distance(i);
          const abs = Math.abs(d);
          if (abs > 2) return null;

          const isActive = d === 0;
          const offsetX = d * 180;     // peek distance
          const scale = isActive ? 1 : 0.78 - (abs - 1) * 0.08;
          const opacity = 1;
          const rotateY = d * -18;
          const zIndex = 10 - abs;

          return (
            <motion.div
              key={i}
              className="absolute top-0 left-1/2 w-[300px] sm:w-[360px] h-[320px] -translate-x-1/2"
              animate={{
                x: `calc(-50% + ${offsetX}px)`,
                scale,
                opacity,
                rotateY,
                zIndex,
              }}
              whileHover={isActive ? { scale: 1.02, y: -4 } : { scale: scale * 1.05 }}
              whileTap={isActive ? { scale: 0.98, y: 2 } : { scale: scale * 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transformStyle: "preserve-3d" }}
              drag={isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={isActive ? onDragEnd : undefined}
              onClick={() => !isActive && go(i)}
            >
              <div
                className={`relative h-full w-full overflow-hidden flex flex-col justify-center items-center text-center p-6 sm:p-8 ${
                  isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                }`}
                style={{
                  borderRadius: "2rem",
                  border: "var(--outline-w) solid oklch(0.14 0.03 285)",
                  background: f.tint ?? "oklch(0.98 0.01 90)",
                  boxShadow: isActive
                    ? "var(--shadow-toon-lg)"
                    : `${6 - abs}px ${6 - abs}px 0 0 oklch(0.14 0.03 285)`,
                  filter: isActive ? "none" : `brightness(${1 - abs * 0.12})`,
                  transition: "box-shadow 0.2s ease"
                }}
              >
                <span className="absolute top-6 right-6 text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: "oklch(0.14 0.03 285 / 0.6)" }}>
                  {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>

                {f.icon && (
                  <div className="mb-5">
                    <ToonIcon icon={f.icon} index={i} size="lg" />
                  </div>
                )}

                <div style={{ color: "oklch(0.14 0.03 285)" }}>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight mb-3">
                    {f.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: "oklch(0.14 0.03 285 / 0.85)" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => go(index - 1)}
          aria-label="Previous feature"
          className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/10 transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-2 items-center px-4 py-2 glass rounded-full" style={{ boxShadow: "var(--shadow-toon-sm)" }}>
          {features.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to feature ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-foreground" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(index + 1)}
          aria-label="Next feature"
          className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/10 transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
