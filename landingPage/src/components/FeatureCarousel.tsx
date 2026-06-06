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
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              style={{ transformStyle: "preserve-3d" }}
              drag={isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={isActive ? onDragEnd : undefined}
              onClick={() => !isActive && go(i)}
            >
              <div
                className={`relative h-full w-full overflow-hidden flex flex-col justify-between p-6 sm:p-7 ${
                  isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                }`}
                style={{
                  borderRadius: "2rem",
                  border: "3px solid oklch(0.14 0.03 285)",
                  background: f.tint ?? "oklch(0.98 0.01 90)",
                  boxShadow: isActive
                    ? "8px 8px 0 0 oklch(0.14 0.03 285)"
                    : `${6 - abs}px ${6 - abs}px 0 0 oklch(0.14 0.03 285)`,
                  filter: isActive ? "none" : `brightness(${1 - abs * 0.12})`,
                }}

              >


                <div className="relative flex items-center justify-between">
                  {f.icon ? <ToonIcon icon={f.icon} index={i} size="md" /> : <span />}
                  <span className="text-[10px] font-mono tracking-widest" style={{ color: "oklch(0.14 0.03 285 / 0.7)" }}>
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                <div className="relative" style={{ color: "oklch(0.14 0.03 285)" }}>
                  <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed line-clamp-4" style={{ color: "oklch(0.14 0.03 285 / 0.78)" }}>
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
          className="w-11 h-11 rounded-full glass border border-border/60 flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2 items-center">
          {features.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to feature ${i + 1}`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(index + 1)}
          aria-label="Next feature"
          className="w-11 h-11 rounded-full glass border border-border/60 flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
