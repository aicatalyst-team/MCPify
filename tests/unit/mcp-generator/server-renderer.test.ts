import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, test } from 'node:test';
import { promisify } from 'node:util';
import { BackendAnalyzer } from '../../../packages/backend-analyzer/dist/index.js';
import { MCPGenerator } from '../../../packages/mcp-generator/dist/index.js';
import { PermissionLayer } from '../../../packages/permissions/dist/index.js';
import { WorkflowEngine } from '../../../packages/workflow-engine/dist/index.js';
import type { ClassifiedTool, Workflow } from '../../../packages/schema-engine/dist/index.js';

const execFileAsync = promisify(execFile);
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true }))
  );
});

test('generated handlers call extracted backend functions and orchestrate workflows', async () => {
  const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mcpify-handler-'));
  tempDirs.push(root);

  await fs.mkdir(path.join(root, 'src'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'src', 'orders.ts'),
    `
export async function getOrderById(orderId: string) {
  return { id: orderId, status: 'pending' };
}

export async function updateOrderStatus(orderId: string, status: string) {
  return { id: orderId, status };
}

export async function fulfillOrder(orderId: string, status: string) {
  await getOrderById(orderId);
  return updateOrderStatus(orderId, status);
}
`,
    'utf-8'
  );

  const extractedTools = await new BackendAnalyzer(root).extract();
  const workflows = await new WorkflowEngine(extractedTools).extract();
  const classified = new PermissionLayer().classify([...extractedTools, ...workflows]);
  const tools = classified.filter(tool => tool.source !== 'workflow') as ClassifiedTool[];
  const classifiedWorkflows = classified.filter(tool => tool.source === 'workflow') as Workflow[];
  const outDir = path.join(root, '.mcpify');

  await new MCPGenerator(outDir).generate(tools, classifiedWorkflows);
  const tsconfig = JSON.parse(await fs.readFile(path.join(outDir, 'tsconfig.json'), 'utf-8'));
  await fs.writeFile(
    path.join(outDir, 'handler-test.tsconfig.json'),
    JSON.stringify({
      ...tsconfig,
      include: ['./handlers.ts', './schemas.ts', '../src/orders.ts'],
    }, null, 2),
    'utf-8'
  );

  await execFileAsync(process.execPath, [
    path.join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc'),
    '-p',
    'handler-test.tsconfig.json',
  ], {
    cwd: outDir,
    timeout: 120_000,
  });

  const packageJson = JSON.parse(await fs.readFile(path.join(outDir, 'package.json'), 'utf-8')) as {
    main: string;
  };
  const handlersPath = path.join(outDir, packageJson.main.replace(/server\.js$/, 'handlers.js'));
  const handlers = await import(pathToFileURL(handlersPath).href + `?t=${Date.now()}`);

  assert.deepEqual(await handlers.handle_getOrderById({ orderId: 'ord_1' }), {
    id: 'ord_1',
    status: 'pending',
  });

  const workflow = await handlers.handle_fulfillOrderWorkflow({
    orderId: 'ord_2',
    status: 'fulfilled',
  });

  assert.deepEqual(workflow, {
    workflow: 'fulfillOrderWorkflow',
    results: [
      { step: 'getOrderById', result: { id: 'ord_2', status: 'pending' } },
      { step: 'updateOrderStatus', result: { id: 'ord_2', status: 'fulfilled' } },
    ],
  });
});
