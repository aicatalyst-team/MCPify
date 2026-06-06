// ─────────────────────────────────────────────────────────────────────────────
// register-clients.ts
//
// After MCPify generates a server, this module auto-registers it into the
// configuration files of local AI clients so the tools appear in the chat bar
// without any manual copy-paste.
//
// Supported clients:
//   codex          — ~/.codex/config.toml          (OpenAI Codex CLI, TOML)
//   claude-code    — <project>/.mcp.json           (Claude Code project scope)
//   claude-desktop — %APPDATA%/Claude/claude_desktop_config.json (global)
//   vscode         — <project>/.vscode/mcp.json    (VS Code MCP)
//
// Each writer merges into existing config — other servers are preserved, and a
// server with the same name is replaced in place.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'fs/promises';
import os from 'os';
import path from 'path';

export type ClientId = 'codex' | 'claude-code' | 'claude-desktop' | 'vscode';

export const ALL_CLIENTS: ClientId[] = ['codex', 'claude-code', 'claude-desktop', 'vscode'];

export interface RegisterOptions {
  /** Sanitized server name used as the MCP server key. */
  serverName: string;
  /** Absolute path to the generated server.ts entry point. */
  serverEntry: string;
  /** Analyzed project root — destination for project-scoped configs. */
  projectRoot: string;
  /** Clients to register into. */
  clients: ClientId[];
}

export interface RegisterResult {
  client: ClientId;
  /** Config file that was (or would be) written. */
  configPath: string;
  status: 'written' | 'skipped' | 'error';
  detail: string;
}

// The command the client will spawn. `npx -y tsx` resolves the locally-installed
// tsx (added to the generated package.json) and runs the TypeScript directly —
// no build step required, just one `npm install` in the output directory.
function launchCommand(serverEntry: string): { command: string; args: string[] } {
  return { command: 'npx', args: ['-y', 'tsx', serverEntry] };
}

export async function registerClients(opts: RegisterOptions): Promise<RegisterResult[]> {
  const results: RegisterResult[] = [];
  const { command, args } = launchCommand(opts.serverEntry);

  for (const client of opts.clients) {
    try {
      switch (client) {
        case 'codex':
          results.push(await registerCodex(opts.serverName, command, args));
          break;
        case 'claude-code':
          results.push(await registerJsonClient(
            client,
            path.join(opts.projectRoot, '.mcp.json'),
            'mcpServers',
            opts.serverName,
            { command, args },
            { alwaysWrite: true }
          ));
          break;
        case 'claude-desktop':
          results.push(await registerJsonClient(
            client,
            claudeDesktopConfigPath(),
            'mcpServers',
            opts.serverName,
            { command, args },
            { requireParentDir: true }
          ));
          break;
        case 'vscode':
          results.push(await registerJsonClient(
            client,
            path.join(opts.projectRoot, '.vscode', 'mcp.json'),
            'servers',
            opts.serverName,
            { type: 'stdio', command, args },
            { alwaysWrite: true }
          ));
          break;
      }
    } catch (err: any) {
      results.push({
        client,
        configPath: '(unknown)',
        status: 'error',
        detail: err?.message ?? String(err),
      });
    }
  }

  return results;
}

// ─── Generic JSON-based clients (Claude Code, Claude Desktop, VS Code) ─────────

interface JsonWriteOptions {
  /** Create the file/dirs even if the parent doesn't exist (project-scoped configs). */
  alwaysWrite?: boolean;
  /** Only write if the parent directory already exists (i.e. the app is installed). */
  requireParentDir?: boolean;
}

async function registerJsonClient(
  client: ClientId,
  configPath: string,
  serversKey: 'mcpServers' | 'servers',
  serverName: string,
  entry: Record<string, unknown>,
  writeOpts: JsonWriteOptions
): Promise<RegisterResult> {
  const dir = path.dirname(configPath);

  if (writeOpts.requireParentDir && !(await pathExists(dir))) {
    return {
      client,
      configPath,
      status: 'skipped',
      detail: 'client not detected (config directory missing)',
    };
  }

  let config: Record<string, any> = {};
  const existing = await readFileOrNull(configPath);
  if (existing && existing.trim()) {
    try {
      config = JSON.parse(existing);
    } catch (err: any) {
      return {
        client,
        configPath,
        status: 'error',
        detail: `existing config is not valid JSON — left untouched (${err.message})`,
      };
    }
  }

  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    return { client, configPath, status: 'error', detail: 'existing config is not a JSON object — left untouched' };
  }

  if (typeof config[serversKey] !== 'object' || config[serversKey] === null) {
    config[serversKey] = {};
  }

  const replaced = Object.prototype.hasOwnProperty.call(config[serversKey], serverName);
  config[serversKey][serverName] = entry;

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

  return {
    client,
    configPath,
    status: 'written',
    detail: replaced ? `updated "${serverName}"` : `added "${serverName}"`,
  };
}

function claudeDesktopConfigPath(): string {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'Claude', 'claude_desktop_config.json');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  }
  // Linux / other
  return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
}

// ─── Codex (TOML) ──────────────────────────────────────────────────────────────

async function registerCodex(
  serverName: string,
  command: string,
  args: string[]
): Promise<RegisterResult> {
  const configPath = path.join(os.homedir(), '.codex', 'config.toml');
  const block = renderCodexBlock(serverName, command, args);

  const existing = (await readFileOrNull(configPath)) ?? '';
  const merged = mergeCodexBlock(existing, serverName, block);

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, merged, 'utf-8');

  const replaced = codexBlockRegex(serverName).test(existing);
  return {
    client: 'codex',
    configPath,
    status: 'written',
    detail: replaced ? `updated [mcp_servers."${serverName}"]` : `added [mcp_servers."${serverName}"]`,
  };
}

export function renderCodexBlock(serverName: string, command: string, args: string[]): string {
  const argList = args.map(tomlString).join(', ');
  return [
    `[mcp_servers.${tomlBareOrQuoted(serverName)}]`,
    `command = ${tomlString(command)}`,
    `args = [${argList}]`,
  ].join('\n');
}

export function mergeCodexBlock(existing: string, serverName: string, block: string): string {
  const re = codexBlockRegex(serverName);
  if (re.test(existing)) {
    // Replace the existing block (header through the line before the next table or EOF).
    return existing.replace(re, block).replace(/\n{3,}/g, '\n\n');
  }
  const base = existing.trimEnd();
  return (base ? base + '\n\n' : '') + block + '\n';
}

function codexBlockRegex(serverName: string): RegExp {
  const escaped = escapeRegExp(serverName);
  // Match  [mcp_servers.name]  or  [mcp_servers."name"]  up to (but excluding)
  // the next top-level table header or end of file.
  return new RegExp(
    String.raw`\[mcp_servers\.(?:"${escaped}"|${escaped})\][\s\S]*?(?=\n\[|\s*$)`,
    'm'
  );
}

// A TOML bare key allows [A-Za-z0-9_-]; otherwise it must be quoted.
function tomlBareOrQuoted(key: string): string {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : tomlString(key);
}

function tomlString(value: string): string {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Turn an arbitrary path/name into a safe MCP server key. */
export function deriveServerName(projectRoot: string): string {
  const base = path.basename(path.resolve(projectRoot)) || 'app';
  const slug = base.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return `mcpify-${slug || 'app'}`;
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readFileOrNull(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, 'utf-8');
  } catch {
    return null;
  }
}
