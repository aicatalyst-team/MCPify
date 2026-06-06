import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { DrizzleAnalyzer } from '../../../packages/backend-analyzer/dist/index.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true }))
  );
});

test('extracts CRUD and semantic query tools from Drizzle tables', async () => {
  const filePath = await writeFixture('schema.ts', `
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  status: text('status').notNull(),
  age: integer('age'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at'),
});
`);

  const tools = await new DrizzleAnalyzer(filePath).extract();
  const byName = new Map(tools.map(tool => [tool.name, tool]));

  assert.deepEqual([...byName.keys()], [
    'getUserById',
    'listUsers',
    'createUser',
    'updateUser',
    'deleteUser',
    'getUsersByEmail',
    'getUsersByStatus',
  ]);
  assert.deepEqual(byName.get('createUser')?.params, [
    'email',
    'status',
    'age',
    'active',
    'createdAt',
  ]);
  assert.deepEqual(byName.get('createUser')?.paramTypes, [
    'string',
    'string',
    'number',
    'boolean',
    'Date',
  ]);
  assert.equal(byName.get('getUsersByStatus')?.source, 'database');
});

test('scans Drizzle schema directories', async () => {
  const filePath = await writeFixture('db/tables.ts', `
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey(),
  slug: text('slug').notNull(),
});
`);

  const tools = await new DrizzleAnalyzer(path.dirname(filePath)).extract();

  assert.ok(tools.some(tool => tool.name === 'getPostById'));
  assert.ok(tools.some(tool => tool.name === 'getPostsBySlug'));
});

async function writeFixture(relativePath: string, source: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcpify-drizzle-'));
  tempDirs.push(dir);

  const filePath = path.join(dir, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, source, 'utf8');
  return filePath;
}
