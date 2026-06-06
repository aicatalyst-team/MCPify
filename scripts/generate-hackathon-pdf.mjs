import fs from 'node:fs/promises';

const outPath = new URL('../MCPify_Hackathon_Explanation.pdf', import.meta.url);

const sections = [
  {
    title: 'MCPify: Hackathon Explanation',
    lines: [
      'MCPify is an AI-enablement compiler for existing applications.',
      'It analyzes backend code, frontend UI, API specs, database schemas, and event handlers, then generates a safe MCP server that AI agents can use directly.',
      '',
      'Core idea: instead of writing MCP tools manually, point MCPify at your app and get a structured AI-operable interface back.',
    ],
  },
  {
    title: 'What MCPify Extracts',
    lines: [
      'Backend functions and class methods from TypeScript / JavaScript.',
      'Frontend actions from React JSX, Vue templates, Svelte, and Angular templates.',
      'OpenAPI / Swagger endpoints.',
      'Database CRUD operations from Prisma, Drizzle, and Mongoose.',
      'Event-driven handlers from EventEmitter, RabbitMQ, Kafka, and webhook routes.',
    ],
  },
  {
    title: 'How the Pipeline Works',
    lines: [
      '1. The CLI orchestrates analysis.',
      '2. Extracted tools are normalized into a shared schema.',
      '3. Workflow detection groups related operations into multi-step flows.',
      '4. Permission classification marks each tool as SAFE, REQUIRES_CONFIRMATION, or BLOCKED.',
      '5. Optional AI enhancement improves names and descriptions.',
      '6. The MCP generator writes a runnable server, schemas, handlers, workflows, and AGENTS.md.',
    ],
  },
  {
    title: 'Safety Model',
    lines: [
      'The project is designed around safety, not just automation.',
      'Exact overrides protect critical tools like deleteDatabase.',
      'Regex rules catch dangerous actions such as refund, checkout, deploy, publish, archive, and send notification.',
      'HTTP methods are used as a fallback heuristic.',
      'The generated server blocks dangerous tools and requires explicit confirmation for mutating actions.',
    ],
  },
  {
    title: 'Workflow Intelligence',
    lines: [
      'MCPify does not stop at isolated functions.',
      'It detects multi-step workflows such as purchase flows, onboarding, password reset, content publish, support resolution, and entity lifecycle management.',
      'This makes the AI interface more semantic: agents can reason about goals instead of calling random low-level functions.',
    ],
  },
  {
    title: 'Generated Output',
    lines: [
      'The generator emits:',
      '- package.json',
      '- tsconfig.json',
      '- schemas.ts',
      '- tools.ts',
      '- workflows.ts',
      '- handlers.ts',
      '- server.ts',
      '- AGENTS.md',
      '',
      'That means the output is not just analysis metadata; it is a deployable MCP package.',
    ],
  },
  {
    title: 'Best Demo Story',
    lines: [
      'Use the ecommerce SaaS example.',
      'The app contains backend services for orders, users, and support, plus a cart and admin dashboard UI.',
      'MCPify extracts safe reads like getOrdersByStatus, gated writes like refundOrder, and frontend actions like checkoutCart and applyDiscountCode.',
      'Judges can immediately see how a normal app becomes AI-operable.',
    ],
  },
  {
    title: 'Pitch Line',
    lines: [
      'MCPify is a compiler for AI agents: it turns existing software into a safe, structured, agent-ready system automatically.',
      '',
      'Short version: we transform human-first apps into AI-operable apps without hand-writing MCP boilerplate.',
    ],
  },
];

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 54;
const MARGIN_TOP = 62;
const MARGIN_BOTTOM = 54;
const FONT_SIZE = 11;
const LEADING = 15;
const TITLE_SIZE = 20;
const SECTION_TITLE_SIZE = 14;

function escapePdfText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function buildPages() {
  const pages = [];
  let current = [];
  let y = PAGE_HEIGHT - MARGIN_TOP;
  const maxChars = 82;

  const pushLine = (line, size = FONT_SIZE, indent = 0) => {
    if (y - size - 4 < MARGIN_BOTTOM) {
      pages.push(current);
      current = [];
      y = PAGE_HEIGHT - MARGIN_TOP;
    }
    current.push({ text: line, size, x: MARGIN_X + indent, y });
    y -= size >= 14 ? 24 : LEADING;
  };

  pushLine('MCPify Hackathon Explanation', TITLE_SIZE);
  pushLine('A judge-ready overview of the compiler, safety model, workflows, and output.', 11);
  y -= 10;

  for (const section of sections) {
    if (y - 40 < MARGIN_BOTTOM) {
      pages.push(current);
      current = [];
      y = PAGE_HEIGHT - MARGIN_TOP;
    }
    pushLine(section.title, SECTION_TITLE_SIZE);
    y -= 3;

    for (const raw of section.lines) {
      if (!raw) {
        y -= 6;
        continue;
      }
      const isBullet = raw.startsWith('- ');
      const indent = isBullet ? 14 : 0;
      const text = isBullet ? raw.slice(2) : raw;
      const wrapped = wrapText(text, isBullet ? 76 : maxChars);
      for (const line of wrapped) {
        pushLine(isBullet ? `• ${line}` : line, FONT_SIZE, indent);
      }
    }
    y -= 8;
  }

  if (current.length) pages.push(current);
  return pages;
}

function makePdf(pages) {
  const objs = [];
  const add = (content) => {
    objs.push(content);
    return objs.length;
  };

  const font1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const font2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds = [];
  const contentIds = [];

  for (const page of pages) {
    let stream = '';
    let first = true;
    for (const item of page) {
      const font = item.size >= 14 ? '/F2' : '/F1';
      const safe = escapePdfText(item.text);
      if (first) {
        stream += 'BT\n';
        first = false;
      }
      stream += `${font} ${item.size} Tf\n1 0 0 1 ${item.x} ${item.y} Tm\n(${safe}) Tj\n`;
    }
    stream += 'ET';
    const content = `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`;
    const cid = add(content);
    contentIds.push(cid);
  }

  for (let i = 0; i < pages.length; i++) {
    const pid = add(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`);
    pageIds.push(pid);
  }

  const pagesObj = add(`<< /Type /Pages /Kids [ ${pageIds.map(id => `${id} 0 R`).join(' ')} ] /Count ${pageIds.length} >>`);
  for (const pid of pageIds) {
    objs[pid - 1] = objs[pid - 1].replace('/Parent 0 0 R', `/Parent ${pagesObj} 0 R`);
  }
  const catalogObj = add(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  let body = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(body, 'latin1');
  body += `xref\n0 ${objs.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (const off of offsets.slice(1)) {
    body += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

const pages = buildPages();
const pdf = makePdf(pages);
await fs.writeFile(outPath, pdf);
console.log(`Wrote ${outPath.pathname} (${pdf.length} bytes, ${pages.length} pages)`);
