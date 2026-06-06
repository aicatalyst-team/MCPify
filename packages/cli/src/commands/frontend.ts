// commands/frontend.ts
import path from 'path';
import { FrontendAnalyzer } from '@mcpify/frontend-analyzer';
import { banner, brand, sym } from '../ui.js';
import { CLI_VERSION } from '../version.js';

export async function runFrontend(rootPath: string, opts: { json?: boolean }) {
  const absRoot = path.resolve(rootPath);

  const analyzer = new FrontendAnalyzer(absRoot);
  const actions  = await analyzer.extract();

  if (opts.json) {
    console.log(JSON.stringify(actions, null, 2));
    return;
  }

  console.log(banner('Frontend Extraction', CLI_VERSION));
  console.log('  ' + brand.dim(`Found ${actions.length} UI actions:`) + '\n');
  for (const a of actions) {
    console.log(
      `  ${sym.ok} ${a.name}` +
      (a.originalHandler ? brand.gray(` ← ${a.originalHandler}`) : '') +
      (a.description ? brand.gray(`\n    ${a.description}`) : '')
    );
  }
  console.log('');
}
