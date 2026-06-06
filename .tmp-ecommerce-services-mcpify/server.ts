#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// MCPify Generated MCP Server
// Auto-generated — re-run `npx mcpify` to regenerate.
//
// Start:   npm run build && npm start
// Connect: add to claude_desktop_config.json (see AGENTS.md)
// ─────────────────────────────────────────────────────────────────────────────

import { Server }               from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { ALL_TOOLS }      from './tools.js';
import { ALL_WORKFLOWS }  from './workflows.js';

// Import your handlers — fill these in inside handlers.ts
import * as handlers from './handlers.js';

// ─────────────────────────────────────────────────────────────────────────────
// Server setup
// ─────────────────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'mcpify-generated', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ─────────────────────────────────────────────────────────────────────────────
// List tools  —  returns all non-blocked tools to the AI agent
// ─────────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const exposedTools: Tool[] = ALL_TOOLS
    .filter(t => t.permission !== 'BLOCKED')
    .map(t => ({
      name:        t.name,
      description: t.permission === 'REQUIRES_CONFIRMATION'
        ? `[REQUIRES CONFIRMATION] ${t.description}`
        : t.description,
      inputSchema: t.inputSchema,
    }));

  // Also expose workflows as callable tools
  const workflowTools: Tool[] = ALL_WORKFLOWS
    .filter(w => w.permission !== 'BLOCKED')
    .map(w => ({
      name:        w.name,
      description: `[WORKFLOW] ${w.description}`,
      inputSchema: { type: 'object' as const, properties: {}, required: [] },
    }));

  return { tools: [...exposedTools, ...workflowTools] };
});

// ─────────────────────────────────────────────────────────────────────────────
// Call tool  —  dispatches to handler, enforces permission gates
// ─────────────────────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  // ── Check if it's a workflow ─────────────────────────────────────────────
  const workflow = ALL_WORKFLOWS.find(w => w.name === name);
  if (workflow) {
    if (workflow.permission === 'BLOCKED') {
      return errorResponse(`Workflow "${name}" is blocked for AI agent execution.`);
    }
    if (workflow.permission === 'REQUIRES_CONFIRMATION' && args['__confirmed'] !== true) {
      return confirmationRequired(name, workflow.description);
    }
    try {
      const handlerFn = (handlers as any)[`handle_${name}`];
      if (typeof handlerFn !== 'function') {
        return errorResponse(`Workflow "${name}" has no handler implementation yet. See handlers.ts.`);
      }
      const result = await handlerFn(args);
      return successResponse(name, result);
    } catch (err: any) {
      return errorResponse(`Workflow "${name}" failed: ${err.message}`);
    }
  }

  // ── Check if it's a regular tool ─────────────────────────────────────────
  const tool = ALL_TOOLS.find(t => t.name === name);
  if (!tool) {
    return errorResponse(`Unknown tool: "${name}". Run npx mcpify to regenerate.`);
  }

  if (tool.permission === 'BLOCKED') {
    return errorResponse(`"${name}" is blocked for AI agent execution. This is a human-only operation.`);
  }

  if (tool.permission === 'REQUIRES_CONFIRMATION' && args['__confirmed'] !== true) {
    return confirmationRequired(name, tool.description);
  }

  // ── Dispatch to handler ───────────────────────────────────────────────────
  try {
    const handlerFn = (handlers as any)[`handle_${name}`];
    if (typeof handlerFn !== 'function') {
      return errorResponse(`"${name}" has no handler implementation yet. Add it to handlers.ts.`);
    }
    const result = await handlerFn(args);
    return successResponse(name, result);
  } catch (err: any) {
    return errorResponse(`"${name}" threw an error: ${err.message}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────────────────────────────────────

function successResponse(name: string, result: unknown) {
  return {
    content: [{
      type: 'text' as const,
      text: typeof result === 'string'
        ? result
        : JSON.stringify(result, null, 2),
    }],
  };
}

function errorResponse(message: string) {
  return {
    content: [{ type: 'text' as const, text: `❌ ${message}` }],
    isError: true,
  };
}

function confirmationRequired(name: string, description: string) {
  return {
    content: [{
      type: 'text' as const,
      text: [
        `⚠️  "${name}" requires explicit user confirmation before execution.`,
        ``,
        `Description: ${description}`,
        ``,
        `To proceed, call this tool again with:`,
        `  { "__confirmed": true, ...your other arguments }`,
        ``,
        `Please ask the user if they want to proceed.`,
      ].join('\n'),
    }],
    isError: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('[mcpify] MCP server running on stdio\n');
  process.stderr.write(`[mcpify] ${ALL_TOOLS.filter(t => t.permission !== 'BLOCKED').length} tools + ${ALL_WORKFLOWS.length} workflows exposed\n`);
}

main().catch(err => {
  process.stderr.write(`[mcpify] Fatal: ${err.message}\n`);
  process.exit(1);
});
