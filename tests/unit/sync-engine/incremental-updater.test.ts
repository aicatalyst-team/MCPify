import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { IncrementalUpdater } from '../../../packages/sync-engine/dist/index.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true }))
  );
});

test('initializes a full cache and generated MCP output', async () => {
  const root = await makeProject({
    'src/orders.ts': `
export async function getOrderById(orderId: string) {
  return { id: orderId };
}
`,
  });
  const outDir = path.join(root, '.mcpify');

  const result = await new IncrementalUpdater(root, outDir, {
    output: outDir,
    frontend: false,
  }).initialize();

  assert.equal(result.mode, 'full');
  assert.equal(result.totalTools, 1);
  assert.ok(await exists(path.join(outDir, 'tools.ts')));
  assert.ok(await exists(path.join(outDir, 'cache', 'incremental-cache.json')));
});

test('updates only the changed source file in the cache', async () => {
  const root = await makeProject({
    'src/orders.ts': `
export async function getOrderById(orderId: string) {
  return { id: orderId };
}
`,
    'src/users.ts': `
export async function getUserById(userId: string) {
  return { id: userId };
}
`,
  });
  const outDir = path.join(root, '.mcpify');
  const updater = new IncrementalUpdater(root, outDir, {
    output: outDir,
    frontend: false,
  });

  await updater.initialize();
  await fs.writeFile(path.join(root, 'src', 'orders.ts'), `
export async function getOrderById(orderId: string) {
  return { id: orderId };
}

export async function refundOrder(orderId: string) {}
`, 'utf8');

  const result = await updater.update(path.join('src', 'orders.ts'), 'change');
  const tools = await fs.readFile(path.join(outDir, 'tools.ts'), 'utf8');

  assert.equal(result.mode, 'incremental');
  assert.equal(result.changedTools, 2);
  assert.equal(result.totalTools, 3);
  assert.match(tools, /getOrderByIdTool/);
  assert.match(tools, /refundOrderTool/);
  assert.match(tools, /getUserByIdTool/);
});

test('removes cached tools when a source file is deleted', async () => {
  const root = await makeProject({
    'src/orders.ts': `
export async function getOrderById(orderId: string) {
  return { id: orderId };
}
`,
    'src/users.ts': `
export async function getUserById(userId: string) {
  return { id: userId };
}
`,
  });
  const outDir = path.join(root, '.mcpify');
  const updater = new IncrementalUpdater(root, outDir, {
    output: outDir,
    frontend: false,
  });

  await updater.initialize();
  await fs.rm(path.join(root, 'src', 'orders.ts'));

  const result = await updater.update(path.join('src', 'orders.ts'), 'unlink');
  const tools = await fs.readFile(path.join(outDir, 'tools.ts'), 'utf8');

  assert.equal(result.mode, 'incremental');
  assert.equal(result.changedTools, 0);
  assert.equal(result.totalTools, 1);
  assert.doesNotMatch(tools, /getOrderByIdTool/);
  assert.match(tools, /getUserByIdTool/);
});

async function makeProject(files: Record<string, string>): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcpify-incremental-'));
  tempDirs.push(root);

  await fs.writeFile(path.join(root, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
    },
    include: ['src/**/*'],
  }, null, 2), 'utf8');

  for (const [relativePath, source] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, source, 'utf8');
  }

  return root;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
