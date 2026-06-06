// ─────────────────────────────────────────────────────────────────────────────
// commands/simulate.ts  —  AI security simulation
// ─────────────────────────────────────────────────────────────────────────────

import path from 'path';

import { banner, section, brand, step } from '../ui.js';
import { CLI_VERSION } from '../version.js';

import { BackendAnalyzer }  from '@mcpify/backend-analyzer';
import { FrontendAnalyzer } from '@mcpify/frontend-analyzer';
import { WorkflowEngine }   from '@mcpify/workflow-engine';
import { PermissionLayer }  from '@mcpify/permissions';
import { applyRuleBasedDescriptions } from '@mcpify/ai-enhancer';
import {
  SimulationEngine,
  formatSimulationReport,
  StaticAuditor,
  formatAuditReport,
} from '@mcpify/security';
import type { ExtractedTool, ClassifiedTool } from '@mcpify/schema-engine';

export async function runSimulate(rootPath: string, _opts: { output?: string }) {
  const absRoot = path.resolve(rootPath);

  console.log(banner('AI Security Simulation', CLI_VERSION));

  // ── Collect tools ──────────────────────────────────────────────────────────
  const allTools: ExtractedTool[] = [];

  const s1 = step('Loading tools…');
  try {
    const [backend, frontend] = await Promise.all([
      new BackendAnalyzer(absRoot).extract().catch(() => []),
      new FrontendAnalyzer(absRoot).extract().catch(() => []),
    ]);
    allTools.push(...backend, ...frontend);
    s1.succeed(brand.dim(`${allTools.length} tools loaded`));
  } catch (e: any) {
    s1.fail(brand.red(`Failed to load tools: ${e.message}`));
    return;
  }

  const workflows = await new WorkflowEngine(allTools).extract();
  const classified = new PermissionLayer().classify([...allTools, ...workflows]);
  const tools = applyRuleBasedDescriptions(classified as any) as ClassifiedTool[];

  // ── Static audit first (no API key needed) ─────────────────────────────────
  console.log(section('Running static audit…'));
  const auditor = new StaticAuditor();
  const audit   = auditor.audit(tools);
  console.log(formatAuditReport(audit));

  // ── AI simulation (needs API key) ─────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ' + brand.yellow('▲ ANTHROPIC_API_KEY not set — skipping AI simulation.') + '\n');
    process.exit(audit.passed ? 0 : 1);
    return;
  }

  console.log(section('Running AI simulation battery…'));
  console.log('  ' + brand.dim('Sends test prompts to Claude to verify security boundaries.') + '\n');

  const engine  = new SimulationEngine();
  const spinner = step('Running simulations (this takes ~30s)…');

  try {
    const results = await engine.run(tools);
    spinner.succeed(brand.dim('Simulation complete'));
    console.log(formatSimulationReport(results));

    const failed = results.filter(r => r.result === 'FAIL').length;
    process.exit(failed === 0 && audit.passed ? 0 : 1);
  } catch (err: any) {
    spinner.fail(brand.red(`Simulation failed: ${err.message}`));
    process.exit(1);
  }
}
