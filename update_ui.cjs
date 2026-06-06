const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'demo', 'demo.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Remove Dark Mode Overrides completely
const darkOverrideRegex = /\/\* ═══════════════════════════════════════════════════\s*CHAT SCENE — DARK MODE OVERRIDES[\s\S]*?\/\* ═══════════════════════════════════════════════════/g;
// Wait, the dark overrides go until the end of the style tag.
// Let's just split by '/* ═══════════════════════════════════════════════════\n   CHAT SCENE — DARK MODE OVERRIDES' and '</style>'
const darkStart = html.indexOf('/* ═══════════════════════════════════════════════════\r\n       CHAT SCENE — DARK MODE OVERRIDES');
const darkStart2 = html.indexOf('/* ═══════════════════════════════════════════════════\n       CHAT SCENE — DARK MODE OVERRIDES');
const actualDarkStart = darkStart !== -1 ? darkStart : (darkStart2 !== -1 ? darkStart2 : html.indexOf('/* ═══════════════════════════════════════════════════\n       CHAT SCENE — DARK MODE OVERRIDES'));

if (html.includes('CHAT SCENE — DARK MODE OVERRIDES')) {
    const startIdx = html.indexOf('/* ═══════════════════════════════════════════════════', html.indexOf('CHAT SCENE — DARK MODE OVERRIDES') - 100);
    const endIdx = html.indexOf('</style>', startIdx);
    html = html.substring(0, startIdx) + '\n  ' + html.substring(endIdx);
}

// 2. Replace SCENE 3 CSS
const cssStartMarker = '/* ═══════════════════════════════════════════════════\n       SCENE 3 — CHAT (Codex + MCPify)';
// Find actual index
let startCssIdx = html.indexOf('SCENE 3 — CHAT (Codex + MCPify)');
startCssIdx = html.lastIndexOf('/* ═══════════════════════════════════════════════════', startCssIdx);
let endCssIdx = html.indexOf('/* ═══════════════════════════════════════════════════', startCssIdx + 100);

const newCss = `/* ═══════════════════════════════════════════════════
       SCENE 3 — CHAT (Codex + MCPify) -> SLEEK DARK REDESIGN
    ═══════════════════════════════════════════════════ */
    #s-chat {
      padding: 24px;
      align-items: center;
      justify-content: center;
      background: oklch(0.12 0.01 285);
      background-image: 
        radial-gradient(circle at top right, oklch(0.20 0.05 305 / 0.4), transparent 40%),
        radial-gradient(circle at bottom left, oklch(0.15 0.05 200 / 0.4), transparent 40%);
    }
    #s-chat::before { display: none; } /* remove grid */

    .chat-layout {
      display: flex;
      width: 1040px;
      height: 640px;
      gap: 20px;
      border-radius: 16px;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .s-card {
      background: rgba(20, 20, 25, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .s-eyebrow {
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: oklch(0.60 0.01 285);
      margin-bottom: 12px;
    }

    .status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .live-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: oklch(0.85 0.15 140);
      box-shadow: 0 0 10px oklch(0.85 0.15 140 / 0.6);
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .status-label { font-size: 14px; color: #fff; font-weight: 500; }
    .status-detail { font-family: var(--font-mono); font-size: 11px; color: oklch(0.50 0.01 285); margin-top: 4px; }

    .s-card.tools { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
    .tool-list { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
    .tool-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: oklch(0.70 0.01 285);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .tool-row.hl {
      background: rgba(168, 85, 247, 0.1);
      border-color: rgba(168, 85, 247, 0.3);
      color: #e9d5ff;
    }
    .tool-row.hl-y {
      background: rgba(234, 179, 8, 0.1);
      border-color: rgba(234, 179, 8, 0.3);
      color: #fef08a;
    }
    .stb {
      font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 600;
      background: rgba(255,255,255,0.05); color: #aaa;
    }
    .stb-s { background: rgba(34, 197, 94, 0.15); color: #86efac; }
    .stb-c { background: rgba(234, 179, 8, 0.15); color: #fde047; }
    .stb-b { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .stb-w { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; }

    /* Chat Main */
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: rgba(15, 15, 20, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }

    .chat-hdr {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.01);
    }
    .codex-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #fff;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
    }
    .hdr-info { flex: 1; }
    .hdr-name { font-size: 15px; font-weight: 600; color: #fff; }
    .hdr-sub { font-size: 12px; color: oklch(0.60 0.01 285); margin-top: 2px; }
    .conn-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 20px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      font-size: 11px; font-weight: 600; color: #4ade80;
    }

    .chat-msgs {
      flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;
    }
    .msg { max-width: 85%; animation: fadeUp 0.3s ease forwards; opacity: 0; transform: translateY(10px); }
    .msg.user { align-self: flex-end; }
    .msg.agent { align-self: flex-start; display: flex; flex-direction: column; gap: 6px; }

    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

    .msg-lbl { display: none; }

    .bubble {
      padding: 12px 16px; font-size: 14px; line-height: 1.6; border-radius: 12px;
    }
    .msg.user .bubble {
      background: #fff; color: #000;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
      font-weight: 500;
    }
    .msg.agent .bubble {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      border-bottom-left-radius: 4px;
    }

    .ic {
      font-family: var(--font-mono); font-size: 12px;
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px; border-radius: 4px; color: #a855f7;
    }

    .tool-box {
      background: rgba(15, 15, 20, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 3px solid #a855f7;
      border-radius: 8px;
      padding: 12px 16px;
      font-family: var(--font-mono); font-size: 12px;
    }
    .tb-hdr { display: flex; align-items: center; gap: 8px; color: #a855f7; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
    .tb-name { color: #fff; font-weight: 600; margin-bottom: 4px; }
    .tb-args { color: #94a3b8; margin-bottom: 8px; }
    .tb-result { border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 8px; color: #4ade80; }

    .confirm-box {
      background: rgba(234, 179, 8, 0.05);
      border: 1px solid rgba(234, 179, 8, 0.2);
      border-left: 3px solid #eab308;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .cnf-hdr { color: #eab308; font-weight: 600; font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;}
    .cnf-body { color: #e2e8f0; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    .cnf-btns { display: flex; gap: 10px; }
    .btn-yes { background: #eab308; color: #000; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .btn-no { background: rgba(255, 255, 255, 0.1); color: #fff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer; }

    .typing-wrap {
      display: flex; align-items: center; gap: 6px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .td { width: 6px; height: 6px; border-radius: 50%; background: #64748b; animation: tdBounce 1.4s infinite ease-in-out both; }
    .td:nth-child(1) { animation-delay: -0.32s; }
    .td:nth-child(2) { animation-delay: -0.16s; }
    @keyframes tdBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

    .wf-steps { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono); font-size: 11px; margin-top: 8px; }
    .wf { color: #64748b; display: flex; align-items: center; gap: 6px; }
    .wf::before { content: '○'; font-size: 14px; }
    .wf.active { color: #eab308; }
    .wf.active::before { content: '◐'; animation: spin 2s linear infinite; }
    .wf.done { color: #4ade80; }
    .wf.done::before { content: '●'; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .inp-bar {
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex; align-items: center; gap: 12px;
    }
    .inp-field {
      flex: 1;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px; color: #fff;
      display: flex; align-items: center;
    }
    .inp-cur { display: inline-block; width: 2px; height: 16px; background: #fff; margin-left: 2px; animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    .send-btn {
      width: 40px; height: 40px; border-radius: 8px;
      background: #fff; color: #000; border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; cursor: pointer;
    }
    
    `;

html = html.substring(0, startCssIdx) + newCss + html.substring(endCssIdx);

// 3. Optional: update HTML slightly if needed (e.g. avatar text)
// The existing HTML works fine with these new classes since I kept class names same.

fs.writeFileSync(filePath, html);
console.log("Updated demo.html successfully.");
