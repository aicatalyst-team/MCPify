## Redesign the Architecture section as a 3D layered stack

Replace the current flat stack of horizontal cards with an **isometric "exploded stack"** visualization that visually communicates the layered architecture concept — like looking at floors of a building from a 3/4 angle, with each layer offset and labeled.

### The concept

```text
        ╱──────────────────────────╲    AI Agents
       ╱     Claude · GPT · Custom  ╲
      ╱──────────────────────────────╲   MCP Layer  ◀ highlighted
     ╱      Tools · Resources · …    ╲
    ╱──────────────────────────────────╲ Permissions
   ╱      Scopes · Audit · …            ╲
  ╱──────────────────────────────────────╲ Workflows
 ╱       Multi-step · Stateful · …        ╲
╱──────────────────────────────────────────╲ Your App
       Frontend · Backend · Database
```

Layers are rendered as parallelogram "slabs" stacked vertically with isometric skew (`transform: rotateX(55deg) rotateZ(-30deg)` style), each layer floating slightly above the next with a connector pin and a soft shadow underneath — giving real depth instead of flat rectangles.

### Interaction & motion

- **Scroll-in**: layers assemble from bottom-up, "Your App" lands first, then each layer drops down on top with a small bounce (framer-motion stagger).
- **Hover a layer**: that slab lifts further (translateZ), neighbors dim slightly, and its label/items panel slides out to the right with full details.
- **MCP Layer** stays visually emphasized at rest (primary accent, glow, a subtle pulsing connector beam down to "Your App" showing the relationship).
- **Side labels**: each layer's name sits on the right edge, connected to its slab by a thin leader line — keeps text readable while the slabs handle the visual weight.
- **Data flow indicator**: a small animated dot travels top→bottom along a vertical "spine" line every few seconds, visualizing an agent call flowing down to the app.

### Layout

- Desktop: isometric stack on the left (~60% width), live detail panel on the right showing the hovered/active layer's items as chips with short descriptions.
- Mobile: skip the isometric skew (perf + readability) — fall back to a cleaner vertical stack of beveled slabs with side labels, keeping the spine line + traveling dot.
- Respects `prefers-reduced-motion`: no traveling dot, no hover lifts, slabs render in final position.

### Visual style

- Match the existing dark theme tokens (`glass`, `shadow-glow`, `--primary`, `border`).
- Each slab: subtle gradient top→bottom (lighter top edge to fake light direction), 1px inner highlight, soft drop shadow on the slab below.
- MCP Layer uses primary accent gradient + glow ring; others use neutral glass.
- Monospace chips for items, kept inside the right-side detail panel rather than on the slab itself (slabs stay clean and architectural).

### Files

- **Edit** `src/routes/index.tsx` → replace the body of `Architecture()` (lines 458-508). Same `layers` data shape (add optional `description` per layer).
- **New** `src/components/ArchitectureStack.tsx` → the isometric stack + detail panel + spine animation. Built with framer-motion (already in use), plain CSS transforms, no new deps.

### Out of scope

- No changes to section title/description, eyebrow, or `Section` wrapper.
- No changes to surrounding sections or the data items themselves (Claude/GPT/Custom, etc. stay as-is).