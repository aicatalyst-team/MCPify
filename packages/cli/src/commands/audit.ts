// ─────────────────────────────────────────────────────────────────────────────
// commands/audit.ts  —  static audit without generating files
// ─────────────────────────────────────────────────────────────────────────────

import path from 'path';

import { BackendAnalyzer }        from '@mcpify/backend-analyzer';
import { FrontendAnalyzer }       from '@mcpify/frontend-analyzer';
import { WorkflowEngine }         from '@mcpify/workflow-engine';
import { PermissionLayer }        from '@mcpify/permissions';
import { StaticAuditor, formatAuditReport } from '@mcpify/security';
import { applyRuleBasedDescriptions }       from '@mcpify/ai-enhancer';
import type { ExtractedTool }     from '@mcpify/schema-engine';

import { banner, section, brand, step, stepDone, stepWarn, permColor } from '../ui.js';
import { CLI_VERSION } from '../version.js';

export async function runAudit(rootPath: string, _opts: { output?: string }) {
  const absRoot = path.resolve(rootPath);

  console.log(banner('Static Safety Audit', CLI_VERSION));

  const allTools: ExtractedTool[] = [];

  const s1 = step('Analyzing backend…');
  try {
    const tools = await new BackendAnalyzer(absRoot).extract();
    allTools.push(...tools);
    stepDone(s1, `${tools.length} backend actions`);
  } catch (e: any) { stepWarn(s1, e.message); }

  const s2 = step('Analyzing frontend…');
  try {
    const tools = await new FrontendAnalyzer(absRoot).extract();
    allTools.push(...tools);
    stepDone(s2, `${tools.length} UI actions`);
  } catch (e: any) { stepWarn(s2, e.message); }

  const s3 = step('Detecting workflows…');
  const workflows = await new WorkflowEngine(allTools).extract();
  stepDone(s3, `${workflows.length} workflows`);

  const classified = new PermissionLayer().classify([...allTools, ...workflows]);
  const withDesc   = applyRuleBasedDescriptions(classified as any);

  // Run static audit
  const auditor = new StaticAuditor();
  const report  = auditor.audit(withDesc as any);

  console.log(formatAuditReport(report));

  // Print tool table
  console.log(section('Tool Overview') + '\n');
  console.log(
    '  ' +
    brand.gray('NAME'.padEnd(40)) +
    brand.gray('SOURCE'.padEnd(12)) +
    brand.gray('PERMISSION')
  );
  console.log('  ' + brand.gray('─'.repeat(70)));

  for (const tool of withDesc) {
    console.log(
      '  ' +
      tool.name.padEnd(40) +
      brand.gray(tool.source.padEnd(12)) +
      permColor(tool.permission)(tool.permission)
    );
  }

  console.log('');
  process.exit(report.passed ? 0 : 1);
}
