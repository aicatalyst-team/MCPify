# MCPify

MCPify analyzes an existing TypeScript/JavaScript app and generates an MCP server that exposes safe, structured tools for AI agents.

## Quick Start

```bash
npm install
npm run build
```

Analyze the example e-commerce app and generate an MCP server:

```bash
npm run mcpify -- analyze examples/ecommerce-saas --output examples/ecommerce-saas/.mcpify
```

Build the generated server:

```bash
cd examples/ecommerce-saas/.mcpify
npm install
npm run build
npm start
```

MCPify generates:

- `tools.ts` with MCP tool metadata
- `schemas.ts` with input validation types
- `handlers.ts` wired to exported backend functions when MCPify can safely import them
- `workflows.ts` for detected multi-step workflows
- `server.ts` for the MCP stdio server
- `AGENTS.md` with tool, workflow, and permission notes

## Connect Claude Desktop

Add the generated server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcpify-ecommerce": {
      "command": "node",
      "args": ["C:/path/to/MCPify/examples/ecommerce-saas/.mcpify/dist/.mcpify/server.js"]
    }
  }
}
```

If your generated `package.json` has a different `main`, use that path under the `.mcpify` directory.

## Connect Cursor

Add this to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mcpify-ecommerce": {
      "command": "node",
      "args": ["examples/ecommerce-saas/.mcpify/dist/.mcpify/server.js"]
    }
  }
}
```

## Current MVP Scope

Generated handlers automatically bind exported backend functions where the tool name matches a valid exported function name. Other tool sources still generate explicit TODO handlers so developers can wire UI, API, database, or event-specific behavior manually.
