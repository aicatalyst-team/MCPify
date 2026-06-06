import { type LucideIcon } from "lucide-react";
import { type CSSProperties } from "react";

const TOON_COLORS = [
  "oklch(0.84 0.17 70)",   // marigold yellow
  "oklch(0.74 0.17 5)",    // bubblegum pink
  "oklch(0.72 0.16 305)",  // lavender purple
  "oklch(0.88 0.21 130)",  // lime
  "oklch(0.78 0.15 50)",   // peach orange
  "oklch(0.88 0.09 180)",  // mint
];

const OUTLINE = "oklch(0.14 0.03 285)";

const SIZE_MAP = {
  sm: { box: "w-10 h-10 rounded-xl", icon: 20, radius: "0.6rem", offset: 3 },
  md: { box: "w-14 h-14 rounded-2xl", icon: 26, radius: "0.9rem", offset: 4 },
  lg: { box: "w-20 h-20 rounded-3xl", icon: 40, radius: "1.2rem", offset: 5 },
};

interface ToonIconProps {
  icon: LucideIcon;
  index?: number;
  color?: string;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function ToonIcon({
  icon: Icon,
  index = 0,
  color,
  size = "md",
  className = "",
}: ToonIconProps) {
  const swatch = color ?? TOON_COLORS[index % TOON_COLORS.length];
  const cfg = SIZE_MAP[size];

  const tileStyle: CSSProperties = {
    background: swatch,
    border: `3px solid ${OUTLINE}`,
    boxShadow: `${cfg.offset}px ${cfg.offset}px 0 0 ${OUTLINE}`,
    borderRadius: cfg.radius,
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${cfg.box} ${className}`}
      style={tileStyle}
    >
      <Icon
        size={cfg.icon}
        strokeWidth={2.75}
        color={OUTLINE}
        absoluteStrokeWidth
      />
    </span>
  );
}

export const TOON_PALETTE = TOON_COLORS;
