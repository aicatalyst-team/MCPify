import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const exampleRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const generatedDir = path.join(exampleRoot, '.mcpify');
const generatedManifestPath = path.join(generatedDir, 'package.json');

const manifest = JSON.parse(await fs.readFile(generatedManifestPath, 'utf8').catch(error => {
  throw new Error(
    `Generated MCP server not found. Run "npm run mcpify", then "cd .mcpify && npm install && npm run build".\n${error.message}`
  );
}));

const generatedRequire = createRequire(generatedManifestPath);
const [{ Client }, { StdioClientTransport }] = await Promise.all([
  import(pathToFileURL(generatedRequire.resolve('@modelcontextprotocol/sdk/client/index.js')).href),
  import(pathToFileURL(generatedRequire.resolve('@modelcontextprotocol/sdk/client/stdio.js')).href),
]);

const serverPath = path.resolve(generatedDir, manifest.main);
await fs.access(serverPath).catch(error => {
  throw new Error(`Generated MCP server is not built at ${serverPath}. Run "cd .mcpify && npm run build".\n${error.message}`);
});

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
});
const client = new Client(
  { name: 'mcpify-ecommerce-smoke', version: '1.0.0' },
  { capabilities: {} }
);

await client.connect(transport);

try {
  const listed = await client.listTools();
  const names = listed.tools.map(tool => tool.name);

  assert.ok(names.includes('getOrdersByStatus'), 'expected backend order tool');
  assert.ok(names.includes('apiGetOrder'), 'expected OpenAPI tool');
  assert.ok(names.includes('listProducts'), 'expected Prisma-derived database tool');
  assert.ok(names.includes('frontendCheckoutCart'), 'expected frontend action tool');
  assert.ok(names.includes('resolveRefundWorkflow'), 'expected workflow tool');
  assert.equal(names.includes('setCoupon'), false, 'React state setter leaked as a tool');

  const pendingOrders = await callText('getOrdersByStatus', { status: 'pending', limit: 5, offset: 0 });
  assert.match(pendingOrders, /order_001/);

  const refundGate = await callText('refundOrder', { orderId: 'order_001' });
  assert.match(refundGate, /requires explicit user confirmation/i);

  const refundResult = await callText('refundOrder', { orderId: 'order_001', __confirmed: true });
  assert.match(refundResult, /"status": "refunded"/);

  const apiResult = await callText('apiGetOrder', { orderId: 'order_001' });
  assert.match(apiResult, /prepared-request/);
  assert.match(apiResult, /\/api\/orders\/order_001/);

  const productRows = await callText('listProducts', { skip: 0, take: 5 });
  assert.match(productRows, /Mechanical Keyboard/);

  const frontendPlan = await callText('frontendCheckoutCart', { __confirmed: true });
  assert.match(frontendPlan, /automation-plan|browser-automation/);

  const workflowResult = await callText('resolveRefundWorkflow', {
    orderId: 'order_001',
    customerId: 'user_001',
    message: 'Your refund has been processed.',
    __confirmed: true,
  });
  assert.match(workflowResult, /resolveRefundWorkflow/);
  assert.match(workflowResult, /sendMessage/);

  console.log(`MCPify ecommerce smoke passed: ${names.length} tools exposed.`);
} finally {
  await client.close();
}

async function callText(name, args = {}) {
  const result = await client.callTool({ name, arguments: args });
  const text = result.content?.[0]?.text ?? '';
  assert.notEqual(result.isError, true, `${name} returned MCP error: ${text}`);
  return text;
}
