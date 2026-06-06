# MCPify

**Compile application code into a runnable [Model Context Protocol](https://modelcontextprotocol.io) server — and auto-register it with your AI clients.**

MCPify scans the parts of an app that matter to agents (backend routes & services,
frontend actions, OpenAPI specs, Prisma/Drizzle/Mongoose models, webhooks and event
listeners), infers multi-step workflows, classifies every action by permission, and
generates a complete MCP server. It then writes the server into your local AI clients
so the tools show up in the chat bar — no manual config.

## Install

```bash
npm install -g mcpify-cli
# or run without installing
npx mcpify-cli analyze ./my-app
```

## Quick start

```bash
mcpify analyze ./my-app
cd ./my-app/.mcpify && npm install
```

Restart your AI client — the generated tools appear automatically.

## What you get

Running `analyze` creates an output directory (`./.mcpify` by default) containing a
runnable MCP server: `server.ts`, `handlers.ts`, `tools.ts`, `workflows.ts`,
`schemas.ts`, `AGENTS.md`, plus standalone `package.json`/`tsconfig.json`.

Every tool is classified as **SAFE** (agent may call autonomously),
**REQUIRES_CONFIRMATION** (agent must ask first), or **BLOCKED** (never exposed).

## Auto-registration

By default MCPify registers the server into the AI clients it can find:

| Client | Config file |
|---|---|
| Codex | `~/.codex/config.toml` |
| Claude Code | `<project>/.mcp.json` |
| Claude Desktop | platform config dir |
| VS Code | `<project>/.vscode/mcp.json` |

Existing servers in those files are preserved. Opt out with `--no-install`, or choose
targets with `--clients codex,claude-code`.

## Commands

| Command | Description |
|---|---|
| `analyze [path]` | Full pipeline → generate + register the MCP server |
| `interactive` | Guided setup: pick analyzers and tools |
| `frontend [path]` | Extract only UI actions (`--json` for raw output) |
| `swagger <file>` | Convert an OpenAPI/Swagger spec to MCP tools |
| `audit [path]` | Static safety audit, no files written |
| `simulate [path]` | Static audit + (with `ANTHROPIC_API_KEY`) an AI security battery |

### Useful `analyze` flags

- `--output <dir>` — output directory (default `./.mcpify`)
- `--swagger <file>` / `--prisma <file>` / `--drizzle <path>` / `--mongoose <path>`
- `--no-frontend` / `--no-events` / `--no-workflows`
- `--ai-enhance` — improve tool descriptions via Claude (needs `ANTHROPIC_API_KEY`)
- `--no-install` / `--clients <list>` — control client registration
- `--watch` — regenerate on source changes

## License

MIT — see the [repository](https://github.com/amarnath3003/MCPify).
