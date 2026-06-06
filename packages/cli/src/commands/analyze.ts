// ─────────────────────────────────────────────────────────────────────────────
// commands/analyze.ts  —  full pipeline orchestration
// ─────────────────────────────────────────────────────────────────────────────

import path from 'path';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';

import {
  BackendAnalyzer,
  DrizzleAnalyzer,
  MongooseAnalyzer,
  PrismaAnalyzer,
  SwaggerConverter,
} from '@mcpify/backend-analyzer';
import { EventAnalyzer }                                     from '@mcpify/event-analyzer';
import { FrontendAnalyzer }                                  from '@mcpify/frontend-analyzer';
import { WorkflowEngine }                                    from '@mcpify/workflow-engine';
import { PermissionLayer, permissionBadge }                  from '@mcpify/permissions';
import { MCPGenerator }                                      from '@mcpify/mcp-generator';
import { AIEnhancer, applyRuleBasedDescriptions }            from '@mcpify/ai-enhancer';
import type { ExtractedTool, ClassifiedTool, Workflow }      from '@mcpify/schema-engine';

import {
  registerClients,
  deriveServerName,
  ALL_CLIENTS,
  type ClientId,
  type RegisterResult,
} from '../register-clients.js';

export interface AnalyzeOptions {
  aiEnhance?:  boolean;
  output:      string;
  watch?:      boolean;
  frontend?:   boolean;   // default true; --no-frontend sets false
  events?:     boolean;   // default true; --no-events sets false
  workflows?:  boolean;   // default true; --no-workflows sets false
  swagger?:    string;
  prisma?:     string;
  drizzle?:    string;
  mongoose?:   string;
  install?:    boolean;   // default true; --no-install sets false
  clients?:    string;    // comma list: codex,claude-code,claude-desktop,vscode,all
}

// ─────────────────────────────────────────────────────────────────────────────

export async function runAnalysis(rootPath: string, opts: AnalyzeOptions) {
  const absRoot = path.resolve(rootPath);
  const outDir  = path.resolve(opts.output);

  printBanner();

  const allTools: ExtractedTool[] = [];

  // ── Step 1: Backend analysis ──────────────────────────────────────────────
  const backendSpinner = step('Analyzing backend TypeScript/JavaScript…');
  try {
    const analyzer   = new BackendAnalyzer(absRoot);
    const backendTools = await analyzer.extract();
    allTools.push(...backendTools);
    done(backendSpinner, `${backendTools.length} backend actions found`);
  } catch (err: any) {
    warn(backendSpinner, `Backend analysis failed: ${err.message}`);
  }

  // ── Step 1b: Swagger / OpenAPI (optional) ─────────────────────────────────
  if (opts.swagger) {
    const swaggerSpinner = step('Converting OpenAPI spec…');
    try {
      const swaggerTools = await SwaggerConverter.fromFile(path.resolve(opts.swagger));
      allTools.push(...swaggerTools);
      done(swaggerSpinner, `${swaggerTools.length} API endpoints converted`);
    } catch (err: any) {
      warn(swaggerSpinner, `Swagger conversion failed: ${err.message}`);
    }
  }

  // ── Step 1c: Prisma schema (optional) ────────────────────────────────────
  if (opts.prisma) {
    const prismaSpinner = step('Analyzing Prisma schema…');
    try {
      const prismaAnalyzer = new PrismaAnalyzer(path.resolve(opts.prisma));
      const prismaTools    = await prismaAnalyzer.extract();
      allTools.push(...prismaTools);
      done(prismaSpinner, `${prismaTools.length} database operations generated`);
    } catch (err: any) {
      warn(prismaSpinner, `Prisma analysis failed: ${err.message}`);
    }
  }

  // Database analyzers (optional)
  if (opts.drizzle) {
    const drizzleSpinner = step('Analyzing Drizzle schemas...');
    try {
      const drizzleAnalyzer = new DrizzleAnalyzer(path.resolve(opts.drizzle));
      const drizzleTools    = await drizzleAnalyzer.extract();
      allTools.push(...drizzleTools);
      done(drizzleSpinner, `${drizzleTools.length} Drizzle database operations generated`);
    } catch (err: any) {
      warn(drizzleSpinner, `Drizzle analysis failed: ${err.message}`);
    }
  }

  if (opts.mongoose) {
    const mongooseSpinner = step('Analyzing Mongoose schemas...');
    try {
      const mongooseAnalyzer = new MongooseAnalyzer(path.resolve(opts.mongoose));
      const mongooseTools    = await mongooseAnalyzer.extract();
      allTools.push(...mongooseTools);
      done(mongooseSpinner, `${mongooseTools.length} Mongoose database operations generated`);
    } catch (err: any) {
      warn(mongooseSpinner, `Mongoose analysis failed: ${err.message}`);
    }
  }

  // Event systems and webhooks
  if (opts.events !== false) {
    const eventSpinner = step('Analyzing event listeners and webhooks...');
    try {
      const eventTools = await new EventAnalyzer(absRoot).extract();
      allTools.push(...eventTools);
      done(eventSpinner, `${eventTools.length} event-driven operations found`);
    } catch (err: any) {
      warn(eventSpinner, `Event analysis failed: ${err.message}`);
    }
  }

  // ── Step 2: Frontend analysis (optional) ─────────────────────────────────
  let frontendCount = 0;
  if (opts.frontend !== false) {
    const frontendSpinner = step('Analyzing frontend components…');
    try {
      const fAnalyzer     = new FrontendAnalyzer(absRoot);
      const frontendTools = await fAnalyzer.extract();
      allTools.push(...frontendTools);
      frontendCount = frontendTools.length;
      done(frontendSpinner, `${frontendTools.length} UI actions found`);
    } catch (err: any) {
      warn(frontendSpinner, `Frontend analysis failed: ${err.message}`);
    }
  }

  // ── Step 3: Workflow detection (optional) ─────────────────────────────────
  let detectedWorkflows: Workflow[] = [];
  const normalizedTools = namespaceDuplicateTools(allTools);
  if (opts.workflows !== false) {
    const workflowSpinner = step('Detecting workflows…');
    try {
      const engine = new WorkflowEngine(normalizedTools);
      detectedWorkflows = await engine.extract();
      done(workflowSpinner, `${detectedWorkflows.length} workflows detected`);
    } catch (err: any) {
      warn(workflowSpinner, `Workflow detection failed: ${err.message}`);
    }
  }

  // ── Step 4: Permission classification ────────────────────────────────────
  const permSpinner = step('Classifying permissions…');
  const permLayer   = new PermissionLayer();
  const classified  = permLayer.classify([...normalizedTools, ...detectedWorkflows]);
  const classifiedTools     = classified.filter(t => t.source !== 'workflow') as ClassifiedTool[];
  const classifiedWorkflows = classified.filter(t => t.source === 'workflow') as Workflow[];
  done(permSpinner, 'Permissions classified');

  // ── Step 5: AI or rule-based description enhancement ────────────────────
  let finalTools = classifiedTools;
  if (opts.aiEnhance && process.env.ANTHROPIC_API_KEY) {
    const aiSpinner = step('Enhancing with Claude AI…');
    try {
      const enhancer = new AIEnhancer();
      finalTools = await enhancer.enhance(classifiedTools);
      done(aiSpinner, 'AI metadata enhancement complete');
    } catch (err: any) {
      warn(aiSpinner, `AI enhancement failed: ${err.message} — using rule-based fallback`);
      finalTools = applyRuleBasedDescriptions(classifiedTools);
    }
  } else {
    finalTools = applyRuleBasedDescriptions(classifiedTools);
  }

  // ── Step 6: MCP generation ────────────────────────────────────────────────
  const genSpinner = step('Generating MCP server…');
  const generator  = new MCPGenerator(outDir);
  const output     = await generator.generate(finalTools, classifiedWorkflows);
  done(genSpinner, 'MCP server generated');

  // ── Step 7: Auto-register the server into local AI clients ────────────────
  let registration: RegisterResult[] = [];
  if (opts.install !== false) {
    const clients = parseClients(opts.clients);
    const regSpinner = step('Registering MCP server with AI clients…');
    try {
      registration = await registerClients({
        serverName:  deriveServerName(absRoot),
        serverEntry: path.join(outDir, 'server.ts'),
        projectRoot: absRoot,
        clients,
      });
      const wrote = registration.filter(r => r.status === 'written').length;
      done(regSpinner, `Registered with ${wrote} client${wrote === 1 ? '' : 's'}`);
    } catch (err: any) {
      warn(regSpinner, `Client registration failed: ${err.message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  printSummary(finalTools, classifiedWorkflows, output.files, outDir, registration);

  // ── Watch mode ────────────────────────────────────────────────────────────
  if (opts.watch) {
    const { startWatcher } = await import('../../src/watcher.js');
    await startWatcher(absRoot, outDir, opts);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function namespaceDuplicateTools(tools: ExtractedTool[]): ExtractedTool[] {
  const counts = new Map<string, number>();
  for (const tool of tools) {
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }

  const used = new Set<string>();
  return tools.map(tool => {
    if ((counts.get(tool.name) ?? 0) === 1 && !used.has(tool.name)) {
      used.add(tool.name);
      return tool;
    }

    const preferredName = used.has(tool.name)
      ? `${tool.source}${pascal(tool.name)}`
      : tool.name;

    let name = preferredName;
    let index = 2;
    while (used.has(name)) {
      name = `${preferredName}${index}`;
      index += 1;
    }

    used.add(name);
    return name === tool.name
      ? tool
      : {
          ...tool,
          name,
          jsdocTags: {
            ...(tool.jsdocTags ?? {}),
            originalName: tool.name,
          },
          description: tool.description
            ? `${tool.description} (${tool.source} surface)`
            : `${tool.source} surface for ${tool.name}`,
        };
  });
}

function pascal(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseClients(raw: string | undefined): ClientId[] {
  if (!raw || raw.trim().toLowerCase() === 'all') return ALL_CLIENTS;
  const requested = raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const valid = requested.filter((c): c is ClientId => (ALL_CLIENTS as string[]).includes(c));
  return valid.length > 0 ? valid : ALL_CLIENTS;
}

function printBanner() {
  console.log('\n' + chalk.cyan('  ⚡  ') + chalk.bold.white('MCPify') + chalk.dim(' — AI Enablement Compiler') + '\n');
}

function step(text: string): Ora {
  return ora({ text, prefixText: '  ' }).start();
}

function done(spinner: Ora, text: string) {
  spinner.succeed(chalk.dim(text));
}

function warn(spinner: Ora, text: string) {
  spinner.warn(chalk.yellow(text));
}

function printSummary(
  tools:        ClassifiedTool[],
  workflows:    Workflow[],
  files:        string[],
  outDir:       string,
  registration: RegisterResult[] = []
) {
  const safe    = tools.filter(t => t.permission === 'SAFE');
  const confirm = tools.filter(t => t.permission === 'REQUIRES_CONFIRMATION');
  const blocked = tools.filter(t => t.permission === 'BLOCKED');

  console.log('\n' + chalk.green.bold('  ✓ MCPify complete!\n'));

  console.log(chalk.dim('  Generated files:'));
  for (const f of files) {
    const rel = f.replace(outDir, '').replace(/^\//, '');
    console.log(`    ${chalk.gray('→')} ${chalk.white(rel)}`);
  }

  console.log('\n' + chalk.white.bold('  Generated tools:'));
  for (const t of [...tools, ...workflows]) {
    const badge = permissionBadge(t.permission);
    const color =
      t.permission === 'SAFE'                  ? chalk.green :
      t.permission === 'REQUIRES_CONFIRMATION' ? chalk.yellow :
      t.permission === 'BLOCKED'               ? chalk.red    : chalk.gray;

    const sig = t.params.length > 0
      ? `${t.name}(${t.params.join(', ')})`
      : `${t.name}()`;

    console.log(`    ${color(badge)}  ${chalk.bold(sig)}`);
  }

  if (registration.length > 0) {
    const labels: Record<string, string> = {
      'codex':          'Codex',
      'claude-code':    'Claude Code',
      'claude-desktop': 'Claude Desktop',
      'vscode':         'VS Code',
    };
    console.log('\n' + chalk.white.bold('  Registered with AI clients:'));
    for (const r of registration) {
      const icon =
        r.status === 'written' ? chalk.green('✓') :
        r.status === 'skipped' ? chalk.yellow('○') :
                                 chalk.red('✗');
      const name = chalk.white((labels[r.client] ?? r.client).padEnd(16));
      console.log(`    ${icon} ${name} ${chalk.dim(r.detail)}`);
      console.log(`      ${chalk.dim(r.configPath)}`);
    }
  }

  console.log([
    '',
    `  ${chalk.green('✅')} ${safe.length} safe    ` +
    `${chalk.yellow('⚠️ ')} ${confirm.length} confirm    ` +
    `${chalk.red('🚫')} ${blocked.length} blocked    ` +
    `${chalk.cyan('🔄')} ${workflows.length} workflows`,
    '',
    `  ${chalk.dim('Output:')} ${chalk.white(outDir)}`,
    '',
    `  ${chalk.dim('Final step:')} ${chalk.cyan('cd ' + outDir + ' && npm install')}`,
    `  ${chalk.dim('Then:')} restart your AI client — the tools appear in the chat bar automatically.`,
    '',
  ].join('\n'));
}
