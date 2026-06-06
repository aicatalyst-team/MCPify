# MCPify Demo

This directory contains the MCPify animated demo and the tools to generate/record it.

## Files

| File | Purpose |
|------|---------|
| `demo.html` | Self-contained browser animation (~40s, loops) |
| `record.js` | Records `demo.html` → `../assets/demo.gif` using Puppeteer |
| `package.json` | Dependencies for the recorder |

---

## Option 1 — View in Browser

Just open `demo.html` in any modern browser. It plays and loops automatically, no server needed.

---

## Option 2 — Record as GIF (automated)

```bash
cd demo
npm install
node record.js
```

Output: `assets/demo.gif` (~15–30 MB, loops, embeds in GitHub README).

**Requirements:** Node.js 18+, internet access for Google Fonts on first load.

---

## Option 3 — Generate as MP4 with AI Video Tools

Use the detailed prompt in [`../brain/mcpify_video_prompt.md`](../brain/mcpify_video_prompt.md) with any of these tools:

| Tool | Quality | Notes |
|------|---------|-------|
| [OpenAI Sora](https://sora.com) | ⭐⭐⭐⭐⭐ | Best for UI screencasts |
| [Runway Gen-3 Alpha](https://runwayml.com) | ⭐⭐⭐⭐ | Generate per-scene, stitch |
| [Kling AI 1.6](https://kling.kuaishou.com) | ⭐⭐⭐⭐ | Good motion consistency |
| [Pika 2.2](https://pika.art) | ⭐⭐⭐ | Fast iteration |
| [Hailuo AI](https://hailuoai.com) | ⭐⭐⭐ | Cinematic output |

After generating the MP4, place it at `assets/demo.mp4` and update the README to use `<video>` tag instead of `<img>`.

---

## Animation Scene Breakdown

| Scene | Duration | Content |
|-------|----------|---------|
| **Intro** | 0–2s | MCPify logo + tagline + command preview |
| **Terminal** | 2–18s | Full `mcpify analyze` pipeline with spinners, summary, tool list |
| **Chat** | 18–38s | 3 MCP interactions: list orders · refund with confirmation · run workflow |
| **Outro** | 38–42s | Logo shimmer + GitHub link |

**Total:** ~42 seconds, then loops.
