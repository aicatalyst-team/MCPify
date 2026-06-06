import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { MongooseAnalyzer } from '../../../packages/backend-analyzer/dist/index.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true }))
  );
});

test('extracts CRUD and semantic query tools from Mongoose models', async () => {
  const filePath = await writeFixture('models/user.ts', `
import mongoose, { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true },
  status: { type: String, enum: ['active', 'suspended'] },
  age: Number,
  admin: Boolean,
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  createdAt: Date,
});

export const User = model('User', userSchema);
`);

  const tools = await new MongooseAnalyzer(filePath).extract();
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
    'admin',
    'organizationId',
    'createdAt',
  ]);
  assert.deepEqual(byName.get('createUser')?.paramTypes, [
    'string',
    'string',
    'number',
    'boolean',
    'string',
    'Date',
  ]);
});

test('extracts inline Mongoose schemas inside model calls', async () => {
  const filePath = await writeFixture('ticket.js', `
const mongoose = require('mongoose');

module.exports = mongoose.model('Ticket', new mongoose.Schema({
  status: String,
  priority: String,
  metadata: Object,
}));
`);

  const tools = await new MongooseAnalyzer(path.dirname(filePath)).extract();
  const names = tools.map(tool => tool.name);

  assert.ok(names.includes('getTicketById'));
  assert.ok(names.includes('createTicket'));
  assert.ok(names.includes('getTicketsByStatus'));
});

async function writeFixture(relativePath: string, source: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcpify-mongoose-'));
  tempDirs.push(dir);

  const filePath = path.join(dir, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, source, 'utf8');
  return filePath;
}
