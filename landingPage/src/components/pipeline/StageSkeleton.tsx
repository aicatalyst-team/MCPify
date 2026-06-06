import { motion } from "framer-motion";
import { TOON_PALETTE } from "../ToonIcon";

const OUTLINE = "oklch(0.14 0.03 285)";

function Frame({ children, tint }: { children: React.ReactNode; tint: string }) {
  return (
    <div
      className="relative w-full h-full p-4 overflow-hidden"
      style={{
        background: `color-mix(in oklab, ${tint} 14%, oklch(0.99 0 0))`,
        border: `3px solid ${OUTLINE}`,
        borderRadius: "1.25rem",
        boxShadow: `5px 5px 0 0 ${OUTLINE}`,
      }}
    >
      {children}
    </div>
  );
}

const Bar = ({ w, delay = 0, tint }: { w: string; delay?: number; tint: string }) => (
  <motion.div
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: w, opacity: 1 }}
    transition={{ duration: 0.5, delay }}
    style={{ background: tint, border: `2px solid ${OUTLINE}`, borderRadius: 6 }}
    className="h-3"
  />
);

export function StageSkeleton({ index }: { index: number }) {
  const tint = TOON_PALETTE[index % TOON_PALETTE.length];

  // Application — UI window
  if (index === 0) {
    return (
      <Frame tint={tint}>
        <div className="flex gap-1.5 mb-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: TOON_PALETTE[i + 1], border: `2px solid ${OUTLINE}` }} />
          ))}
        </div>
        <div className="space-y-2">
          <Bar w="70%" tint={tint} />
          <Bar w="90%" delay={0.1} tint="oklch(0.95 0 0)" />
          <Bar w="55%" delay={0.2} tint="oklch(0.95 0 0)" />
          <div className="flex gap-2 pt-1">
            <Bar w="30%" delay={0.3} tint={TOON_PALETTE[1]} />
            <Bar w="20%" delay={0.4} tint={TOON_PALETTE[3]} />
          </div>
        </div>
      </Frame>
    );
  }

  // Static Analysis — AST tree
  if (index === 1) {
    return (
      <Frame tint={tint}>
        <svg viewBox="0 0 200 130" className="w-full h-full">
          {[
            ["M100,18 L50,55", 0],
            ["M100,18 L150,55", 0.1],
            ["M50,55 L25,100", 0.25],
            ["M50,55 L75,100", 0.3],
            ["M150,55 L125,100", 0.35],
            ["M150,55 L175,100", 0.4],
          ].map(([d, delay], i) => (
            <motion.path
              key={i}
              d={d as string}
              stroke={OUTLINE}
              strokeWidth={2.5}
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: delay as number }}
            />
          ))}
          {[[100, 18], [50, 55], [150, 55], [25, 100], [75, 100], [125, 100], [175, 100]].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={9}
              fill={TOON_PALETTE[i % TOON_PALETTE.length]}
              stroke={OUTLINE}
              strokeWidth={2.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
        </svg>
      </Frame>
    );
  }

  // Semantic Understanding — tokens
  if (index === 2) {
    const tokens = ["fetch", "user", "id", "→", "render", "list"];
    return (
      <Frame tint={tint}>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <motion.span
              key={i}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="px-2 py-1 text-xs font-mono"
              style={{
                background: TOON_PALETTE[i % TOON_PALETTE.length],
                border: `2px solid ${OUTLINE}`,
                borderRadius: 8,
                color: OUTLINE,
              }}
            >
              {t}
            </motion.span>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          <Bar w="80%" delay={0.5} tint="oklch(0.95 0 0)" />
          <Bar w="60%" delay={0.6} tint="oklch(0.95 0 0)" />
        </div>
      </Frame>
    );
  }

  // Workflow Extraction — graph
  if (index === 3) {
    const nodes = [
      [30, 65], [85, 30], [85, 100], [140, 65], [190, 65],
    ];
    const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
    return (
      <Frame tint={tint}>
        <svg viewBox="0 0 220 130" className="w-full h-full">
          {edges.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
              stroke={OUTLINE} strokeWidth={2.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            />
          ))}
          {nodes.map(([cx, cy], i) => (
            <motion.rect
              key={i}
              x={cx - 12} y={cy - 9} width={24} height={18} rx={5}
              fill={TOON_PALETTE[i % TOON_PALETTE.length]}
              stroke={OUTLINE} strokeWidth={2.5}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
        </svg>
      </Frame>
    );
  }

  // Safety Layer — permission rows
  if (index === 4) {
    const rows = ["read:users", "write:posts", "admin:billing"];
    return (
      <Frame tint={tint}>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.12 }}
              className="flex items-center justify-between px-2.5 py-1.5"
              style={{ background: "oklch(0.98 0 0)", border: `2px solid ${OUTLINE}`, borderRadius: 8 }}
            >
              <span className="text-xs font-mono" style={{ color: OUTLINE }}>{r}</span>
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 400 }}
                className="w-5 h-5 flex items-center justify-center text-[10px] font-bold"
                style={{ background: TOON_PALETTE[(i + 3) % TOON_PALETTE.length], border: `2px solid ${OUTLINE}`, borderRadius: 6, color: OUTLINE }}
              >
                ✓
              </motion.span>
            </motion.div>
          ))}
        </div>
      </Frame>
    );
  }

  // MCP Generation — code
  if (index === 5) {
    const lines = [
      { w: "60%", c: TOON_PALETTE[2] },
      { w: "85%", c: "oklch(0.95 0 0)" },
      { w: "70%", c: "oklch(0.95 0 0)" },
      { w: "45%", c: TOON_PALETTE[1] },
      { w: "75%", c: "oklch(0.95 0 0)" },
    ];
    return (
      <Frame tint={tint}>
        <div className="space-y-2 font-mono">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] w-3" style={{ color: OUTLINE, opacity: 0.4 }}>{i + 1}</span>
              <Bar w={l.w} delay={i * 0.08} tint={l.c} />
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  // AI-Operable System — chat + tool call
  return (
    <Frame tint={tint}>
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-2.5 py-1.5 text-xs max-w-[80%]"
          style={{ background: "oklch(0.98 0 0)", border: `2px solid ${OUTLINE}`, borderRadius: 10, color: OUTLINE }}
        >
          Cancel order #4421
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="ml-auto px-2.5 py-1.5 text-xs max-w-[80%]"
          style={{ background: TOON_PALETTE[2], border: `2px solid ${OUTLINE}`, borderRadius: 10, color: OUTLINE }}
        >
          → orders.cancel(4421)
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center gap-1.5 text-[10px] font-mono"
          style={{ color: OUTLINE }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: TOON_PALETTE[3] }}
          />
          tool executed
        </motion.div>
      </div>
    </Frame>
  );
}
