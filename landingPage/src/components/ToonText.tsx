import { type CSSProperties } from "react";

// Palette pulled directly from the MCPify logo.
const LETTER_COLORS = [
  "oklch(0.84 0.17 70)",   // marigold yellow
  "oklch(0.74 0.17 5)",    // bubblegum pink
  "oklch(0.72 0.16 305)",  // lavender purple
  "oklch(0.88 0.21 130)",  // lime
  "oklch(0.78 0.15 50)",   // peach orange
  "oklch(0.88 0.09 180)",  // mint
];

const OUTLINE = "oklch(0.14 0.03 285)";

const letterStyle = (color: string): CSSProperties => ({
  color,
  display: "inline-block",
  filter: [
    `drop-shadow( 1px  0 ${OUTLINE})`,
    `drop-shadow(-1px  0 ${OUTLINE})`,
    `drop-shadow( 0  1px ${OUTLINE})`,
    `drop-shadow( 0 -1px ${OUTLINE})`,
    `drop-shadow( 1px  1px ${OUTLINE})`,
    `drop-shadow(-1px  1px ${OUTLINE})`,
    `drop-shadow( 1px -1px ${OUTLINE})`,
    `drop-shadow(-1px -1px ${OUTLINE})`,
    `drop-shadow( 3px  3px 0 ${OUTLINE})`,
  ].join(" "),
});

interface ToonTextProps {
  children: string;
  /** Optional starting index into the palette, so adjacent ToonText blocks don't repeat. */
  offset?: number;
  className?: string;
}

export function ToonText({ children, offset = 0, className }: ToonTextProps) {
  let colorIdx = 0;
  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {Array.from(children).map((ch, i) => {
        if (ch === " ") {
          return (
            <span key={i} aria-hidden="true">
              {"\u00A0"}
            </span>
          );
        }
        const color = LETTER_COLORS[(colorIdx + offset) % LETTER_COLORS.length];
        colorIdx += 1;
        return (
          <span key={i} style={letterStyle(color)}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
