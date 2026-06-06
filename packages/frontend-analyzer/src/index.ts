import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import type { ExtractedTool } from '@mcpify/schema-engine';

const traverse = (_traverse as any).default ?? _traverse;

type FrontendFramework = 'react' | 'vue' | 'svelte' | 'angular';

interface IntentResolution {
  action: string;
  description: string;
}

interface FormField {
  name: string;
  type: string;
}

interface HtmlElement {
  tag: string;
  attrs: string;
  content: string;
}

const INTENT_MAP: Array<{ patterns: string[]; action: string; description: string }> = [
  { patterns: ['checkout', 'check out', 'proceed to checkout'], action: 'checkoutCart', description: 'Initiates the cart checkout flow' },
  { patterns: ['add to cart', 'add to bag', 'add item'], action: 'addItemToCart', description: 'Adds an item to the shopping cart' },
  { patterns: ['remove from cart', 'remove item'], action: 'removeItemFromCart', description: 'Removes an item from the cart' },
  { patterns: ['buy now', 'purchase'], action: 'initiatePurchase', description: 'Triggers an immediate purchase' },
  { patterns: ['pay', 'make payment', 'complete payment'], action: 'processPayment', description: 'Processes a payment transaction' },
  { patterns: ['apply coupon', 'apply promo', 'apply discount'], action: 'applyDiscountCode', description: 'Applies a coupon or discount code to the cart' },
  { patterns: ['refund', 'request refund'], action: 'refundOrder', description: 'Initiates an order refund' },
  { patterns: ['cancel order', 'cancel subscription'], action: 'cancelOrder', description: 'Cancels an order or subscription' },
  { patterns: ['subscribe', 'start subscription'], action: 'createSubscription', description: 'Creates a recurring subscription' },
  { patterns: ['unsubscribe', 'cancel plan'], action: 'cancelSubscription', description: 'Cancels a subscription plan' },

  { patterns: ['login', 'log in', 'sign in'], action: 'authenticateUser', description: 'Authenticates a user session' },
  { patterns: ['logout', 'log out', 'sign out'], action: 'logoutUser', description: 'Terminates the current user session' },
  { patterns: ['register', 'sign up', 'create account'], action: 'registerUser', description: 'Creates a new user account' },
  { patterns: ['forgot password', 'reset password'], action: 'initiatePasswordReset', description: 'Sends a password reset email' },
  { patterns: ['change password', 'update password'], action: 'updatePassword', description: 'Updates the account password' },
  { patterns: ['verify email', 'confirm email'], action: 'verifyEmail', description: 'Confirms user email ownership' },
  { patterns: ['enable 2fa', 'enable two-factor'], action: 'enable2FA', description: 'Enables two-factor authentication' },

  { patterns: ['save', 'save changes', 'apply changes'], action: 'saveChanges', description: 'Persists unsaved changes' },
  { patterns: ['create', 'new', 'add new'], action: 'createRecord', description: 'Creates a new record or entity' },
  { patterns: ['edit', 'update', 'modify'], action: 'updateRecord', description: 'Updates an existing record' },
  { patterns: ['delete', 'remove', 'trash'], action: 'deleteRecord', description: 'Deletes a record permanently' },
  { patterns: ['archive'], action: 'archiveRecord', description: 'Archives a record without deletion' },
  { patterns: ['restore', 'unarchive'], action: 'restoreRecord', description: 'Restores an archived record' },
  { patterns: ['publish', 'go live'], action: 'publishContent', description: 'Makes content publicly visible' },
  { patterns: ['unpublish', 'take offline'], action: 'unpublishContent', description: 'Hides content from public view' },
  { patterns: ['duplicate', 'clone'], action: 'duplicateRecord', description: 'Creates a copy of a record' },

  { patterns: ['send', 'send message', 'send email'], action: 'sendMessage', description: 'Sends a message or email' },
  { patterns: ['reply', 'respond'], action: 'replyToMessage', description: 'Replies to an existing message' },
  { patterns: ['share'], action: 'shareContent', description: 'Shares content with others' },
  { patterns: ['invite', 'invite user', 'send invite'], action: 'inviteUser', description: 'Sends an invitation to a user' },
  { patterns: ['submit support ticket', 'contact support', 'get help'], action: 'createSupportRequest', description: 'Opens a customer support ticket' },
  { patterns: ['notify', 'send notification'], action: 'sendNotification', description: 'Sends a notification' },

  { patterns: ['upload', 'upload file', 'attach'], action: 'uploadFile', description: 'Uploads a file' },
  { patterns: ['download', 'export file'], action: 'downloadFile', description: 'Downloads a file' },
  { patterns: ['import', 'import data'], action: 'importData', description: 'Imports data from a file' },
  { patterns: ['export', 'export data', 'export csv'], action: 'exportData', description: 'Exports data to a file' },

  { patterns: ['search', 'find', 'look up'], action: 'searchItems', description: 'Searches for matching items' },
  { patterns: ['filter', 'apply filters'], action: 'filterItems', description: 'Filters a list of items' },
  { patterns: ['sort'], action: 'sortItems', description: 'Sorts a list of items' },

  { patterns: ['approve', 'accept', 'confirm'], action: 'approveRequest', description: 'Approves a pending request' },
  { patterns: ['reject', 'decline', 'deny'], action: 'rejectRequest', description: 'Rejects a pending request' },
  { patterns: ['escalate'], action: 'escalateIssue', description: 'Escalates an issue to a higher tier' },
  { patterns: ['assign', 'reassign'], action: 'assignTask', description: 'Assigns a task to a team member' },
  { patterns: ['close', 'resolve', 'mark as done'], action: 'resolveIssue', description: 'Marks an issue or task as resolved' },

  { patterns: ['submit', 'submit form'], action: 'submitForm', description: 'Submits a form with user input' },
  { patterns: ['cancel', 'go back', 'discard'], action: 'cancelOperation', description: 'Cancels the current operation' },
  { patterns: ['refresh', 'reload'], action: 'refreshData', description: 'Reloads the current data' },
];

export function resolveIntent(text: string): IntentResolution | null {
  const lower = normalizeWhitespace(text).toLowerCase();
  for (const entry of INTENT_MAP) {
    if (entry.patterns.some(pattern => lower === pattern || lower.includes(pattern))) {
      return { action: entry.action, description: entry.description };
    }
  }
  return null;
}

export class FrontendAnalyzer {
  constructor(private rootPath: string) {}

  async extract(): Promise<ExtractedTool[]> {
    const actions: ExtractedTool[] = [];
    const files = await glob('**/*.{tsx,jsx,vue,svelte,html,ts,js}', {
      cwd: this.rootPath,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.mcpify/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.stories.*',
        '**/*.d.ts',
      ],
    });

    for (const file of files) {
      const filePath = path.join(this.rootPath, file);
      const code = await fs.readFile(filePath, 'utf-8').catch(() => '');
      if (!code) continue;

      if (/\.(tsx|jsx)$/i.test(file)) {
        actions.push(...this.parseJsxFile(code, filePath));
      } else if (/\.vue$/i.test(file)) {
        actions.push(...this.parseTemplateFile(extractVueTemplate(code), filePath, 'vue'));
      } else if (/\.svelte$/i.test(file)) {
        actions.push(...this.parseTemplateFile(stripScriptAndStyle(code), filePath, 'svelte'));
      } else if (/\.html$/i.test(file)) {
        actions.push(...this.parseTemplateFile(code, filePath, 'angular'));
      } else if (/\.component\.[jt]s$/i.test(file)) {
        for (const template of extractAngularInlineTemplates(code)) {
          actions.push(...this.parseTemplateFile(template, filePath, 'angular'));
        }
      }
    }

    return deduplicate(actions);
  }

  private parseJsxFile(code: string, filePath: string): ExtractedTool[] {
    let ast: any;
    try {
      ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
      });
    } catch {
      return [];
    }

    const actions: ExtractedTool[] = [];

    traverse(ast, {
      JSXAttribute: (nodePath: any) => {
        const attrName = nodePath.node.name?.name;
        if (typeof attrName !== 'string' || !/^on[A-Z]/.test(attrName)) return;

        const handlerName = jsxHandlerName(nodePath.node.value, attrName);
        const jsxElement = nodePath.parentPath?.parent;
        const elementText = extractJsxText(jsxElement);
        const params = jsxElement?.openingElement?.name?.name === 'form'
          ? jsxFormFields(jsxElement)
          : [];
        const tool = buildFrontendTool({
          framework: 'react',
          filePath,
          eventName: attrName.replace(/^on/, '').toLowerCase(),
          elementText,
          handlerName,
          params,
        });

        if (tool) actions.push(tool);
      },

      JSXOpeningElement: (nodePath: any) => {
        const tagName = nodePath.node.name?.name ?? nodePath.node.name?.property?.name;
        if (tagName !== 'form') return;

        const jsxElement = nodePath.parentPath?.node;
        const onSubmit = nodePath.node.attributes?.find((attr: any) => attr.name?.name === 'onSubmit');
        const actionAttr = nodePath.node.attributes?.find((attr: any) => attr.name?.name === 'action');
        const handlerName = jsxHandlerName(onSubmit?.value, 'onSubmit');
        const actionValue = typeof actionAttr?.value?.value === 'string' ? actionAttr.value.value : null;
        const params = jsxElement ? jsxFormFields(jsxElement) : [];
        const tool = buildFrontendTool({
          framework: 'react',
          filePath,
          eventName: 'submit',
          elementText: actionValue,
          handlerName,
          params,
          fallbackAction: 'submitForm',
          fallbackDescription: 'Submits a React form with user-entered data',
        });

        if (tool) actions.push(tool);
      },
    });

    return actions;
  }

  private parseTemplateFile(template: string, filePath: string, framework: FrontendFramework): ExtractedTool[] {
    if (!template.trim()) return [];

    const actions: ExtractedTool[] = [];
    for (const element of parseHtmlElements(template)) {
      const eventBindings = templateEventBindings(element.attrs, framework);
      const elementText = extractVisibleText(element.content);
      const params = element.tag === 'form' ? templateFormFields(element.content) : [];

      if (element.tag === 'form' && !eventBindings.some(binding => binding.eventName === 'submit')) {
        const tool = buildFrontendTool({
          framework,
          filePath,
          eventName: 'submit',
          elementText,
          params,
          fallbackAction: 'submitForm',
          fallbackDescription: `Submits a ${frameworkLabel(framework)} form with user-entered data`,
        });
        if (tool) actions.push(tool);
      }

      for (const binding of eventBindings) {
        const tool = buildFrontendTool({
          framework,
          filePath,
          eventName: binding.eventName,
          elementText,
          handlerName: binding.handlerName,
          params,
        });
        if (tool) actions.push(tool);
      }
    }

    return actions;
  }
}

function buildFrontendTool(input: {
  framework: FrontendFramework;
  filePath: string;
  eventName: string;
  elementText: string | null;
  handlerName?: string | null;
  params?: FormField[];
  fallbackAction?: string;
  fallbackDescription?: string;
}): ExtractedTool | null {
  const cleanedHandler = input.handlerName ? stripHandlerPrefix(input.handlerName) : null;
  const textIntent = input.elementText ? resolveIntent(input.elementText) : null;
  const handlerIntent = cleanedHandler ? resolveIntent(splitIdentifierWords(cleanedHandler)) : null;

  const action = textIntent?.action
    ?? handlerIntent?.action
    ?? cleanedHandler
    ?? input.fallbackAction
    ?? (input.eventName === 'submit' ? 'submitForm' : null);

  if (!action) return null;

  const description = textIntent?.description
    ?? handlerIntent?.description
    ?? input.fallbackDescription
    ?? `${frameworkLabel(input.framework)} UI action triggered by ${describeTrigger(input.eventName, input.elementText, input.handlerName)}`;
  const fields = input.params ?? [];

  return {
    name: action,
    source: 'frontend',
    description,
    params: fields.map(field => field.name),
    paramTypes: fields.map(field => field.type),
    returnType: 'void',
    filePath: input.filePath,
    permission: 'UNKNOWN',
    isAsync: false,
    originalHandler: input.handlerName ?? undefined,
  };
}

function jsxHandlerName(value: any, attrName: string): string | null {
  if (!value) return attrName === 'onSubmit' ? 'submitForm' : null;
  if (value.type !== 'JSXExpressionContainer') return null;

  const expr = value.expression;
  if (!expr) return null;
  if (expr.type === 'Identifier') return expr.name;
  if (expr.type === 'MemberExpression') return memberExpressionName(expr);
  if (expr.type === 'CallExpression') return calleeName(expr.callee);
  if (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression') {
    return firstCalledFunctionName(expr.body) ?? (attrName === 'onSubmit' ? 'submitForm' : null);
  }
  return null;
}

function memberExpressionName(expr: any): string | null {
  if (expr.property?.name) return expr.property.name;
  if (expr.property?.value) return String(expr.property.value);
  return null;
}

function calleeName(callee: any): string | null {
  if (!callee) return null;
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression') return memberExpressionName(callee);
  return null;
}

function firstCalledFunctionName(node: any): string | null {
  if (!node) return null;
  if (node.type === 'CallExpression') return calleeName(node.callee);
  if (node.type === 'BlockStatement') {
    for (const statement of node.body ?? []) {
      const name = firstCalledFunctionName(statement);
      if (name) return name;
    }
  }
  if (node.type === 'ExpressionStatement') return firstCalledFunctionName(node.expression);
  if (node.type === 'ReturnStatement') return firstCalledFunctionName(node.argument);
  return null;
}

function extractJsxText(jsxElement: any): string | null {
  if (!jsxElement?.children) return null;
  const texts: string[] = [];

  for (const child of jsxElement.children) {
    if (child.type === 'JSXText') {
      const text = normalizeWhitespace(child.value);
      if (text) texts.push(text);
    } else if (child.type === 'JSXExpressionContainer' && child.expression?.type === 'StringLiteral') {
      texts.push(child.expression.value);
    } else if (child.type === 'JSXElement') {
      const nested = extractJsxText(child);
      if (nested) texts.push(nested);
    }
  }

  return texts.length > 0 ? texts.join(' ') : null;
}

function jsxFormFields(jsxElement: any): FormField[] {
  const fields: FormField[] = [];
  const visit = (node: any) => {
    if (!node) return;
    if (node.type === 'JSXElement') {
      const tag = node.openingElement?.name?.name;
      if (tag === 'input' || tag === 'select' || tag === 'textarea') {
        const attrs = node.openingElement.attributes ?? [];
        const name = jsxAttributeValue(attrs, 'name');
        if (name) fields.push({ name: sanitizeParamName(name), type: jsxInputType(tag, jsxAttributeValue(attrs, 'type')) });
      }
      for (const child of node.children ?? []) visit(child);
    }
  };

  visit(jsxElement);
  return dedupeFields(fields);
}

function jsxAttributeValue(attrs: any[], name: string): string | null {
  const attr = attrs.find(item => item.name?.name === name);
  if (!attr) return null;
  if (typeof attr.value?.value === 'string') return attr.value.value;
  if (attr.value?.type === 'JSXExpressionContainer' && attr.value.expression?.type === 'StringLiteral') {
    return attr.value.expression.value;
  }
  return null;
}

function jsxInputType(tag: string, type: string | null): string {
  if (tag === 'select') return 'string';
  if (type === 'number' || type === 'range') return 'number';
  if (type === 'checkbox' || type === 'radio') return 'boolean';
  return 'string';
}

function extractVueTemplate(code: string): string {
  const match = code.match(/<template(?:\s[^>]*)?>([\s\S]*?)<\/template>/i);
  return match?.[1] ?? '';
}

function stripScriptAndStyle(code: string): string {
  return code
    .replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '');
}

function extractAngularInlineTemplates(code: string): string[] {
  const templates: string[] = [];
  const templateRegex = /\btemplate\s*:\s*(`([\s\S]*?)`|'([\s\S]*?)'|"([\s\S]*?)")/g;
  let match: RegExpExecArray | null;

  while ((match = templateRegex.exec(code))) {
    templates.push(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return templates;
}

function parseHtmlElements(template: string): HtmlElement[] {
  const elements: HtmlElement[] = [];
  const openTagRegex = /<([A-Za-z][\w:.-]*)([^<>]*?)(\/?)>/g;
  let match: RegExpExecArray | null;

  while ((match = openTagRegex.exec(template))) {
    const raw = match[0];
    if (raw.startsWith('</') || raw.startsWith('<!--') || raw.startsWith('<!')) continue;

    const tag = match[1].toLowerCase();
    const attrs = match[2] ?? '';
    const closeIndex = template.indexOf(`</${match[1]}>`, openTagRegex.lastIndex);
    const content = closeIndex >= 0 ? template.slice(openTagRegex.lastIndex, closeIndex) : '';
    elements.push({ tag, attrs, content });
  }

  return elements;
}

function templateEventBindings(attrs: string, framework: FrontendFramework): Array<{ eventName: string; handlerName: string | null }> {
  const bindings: Array<{ eventName: string; handlerName: string | null }> = [];
  const attrRegex = /([:@()A-Za-z][\w:().@|-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrs))) {
    const attrName = match[1];
    const attrValue = match[2] ?? match[3] ?? match[4] ?? '';
    const eventName = eventNameFromAttribute(attrName, framework);
    if (!eventName) continue;

    bindings.push({
      eventName,
      handlerName: handlerNameFromTemplateExpression(attrValue),
    });
  }

  return bindings;
}

function eventNameFromAttribute(attrName: string, framework: FrontendFramework): string | null {
  if (framework === 'vue') {
    if (attrName.startsWith('@')) return attrName.slice(1).split('.')[0].split(':')[0];
    if (attrName.startsWith('v-on:')) return attrName.slice('v-on:'.length).split('.')[0];
  }

  if (framework === 'svelte') {
    if (attrName.startsWith('on:')) return attrName.slice('on:'.length).split('|')[0];
  }

  if (framework === 'angular') {
    if (attrName.startsWith('(') && attrName.endsWith(')')) {
      const event = attrName.slice(1, -1);
      return event === 'ngSubmit' ? 'submit' : event;
    }
  }

  return null;
}

function handlerNameFromTemplateExpression(expression: string): string | null {
  const clean = expression
    .trim()
    .replace(/^\{|\}$/g, '')
    .replace(/\$event/g, '')
    .trim();

  if (!clean) return null;

  const callMatches = [...clean.matchAll(/(?:this\.)?((?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*)\s*\(/g)];
  const call = callMatches.at(-1)?.[1];
  if (call) return lastPathSegment(call);

  const identifier = clean.match(/^(?:this\.)?((?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*)$/)?.[1];
  return identifier ? lastPathSegment(identifier) : null;
}

function templateFormFields(content: string): FormField[] {
  const fields: FormField[] = [];
  const fieldTagRegex = /<(input|select|textarea)\b([^<>]*?)(?:\/?>|>[\s\S]*?<\/\1>)/gi;
  let match: RegExpExecArray | null;

  while ((match = fieldTagRegex.exec(content))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] ?? '';
    const fieldName = attributeValue(attrs, 'name')
      ?? attributeValue(attrs, 'formControlName')
      ?? modelFieldName(attributeValue(attrs, 'v-model') ?? attributeValue(attrs, 'bind:value'));
    if (!fieldName) continue;

    fields.push({
      name: sanitizeParamName(fieldName),
      type: htmlInputType(tag, attributeValue(attrs, 'type')),
    });
  }

  return dedupeFields(fields);
}

function attributeValue(attrs: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = attrs.match(new RegExp(`\\b${escaped}(?:\\.\\w+)?\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function modelFieldName(value: string | null): string | null {
  if (!value) return null;
  return lastPathSegment(value.replace(/^\{|\}$/g, '').trim());
}

function htmlInputType(tag: string, type: string | null): string {
  if (tag === 'select') return 'string';
  if (type === 'number' || type === 'range') return 'number';
  if (type === 'checkbox' || type === 'radio') return 'boolean';
  return 'string';
}

function extractVisibleText(content: string): string | null {
  const text = normalizeWhitespace(
    content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{\{[\s\S]*?\}\}/g, ' ')
      .replace(/\{[\s\S]*?\}/g, ' ')
  );
  return text || null;
}

function stripHandlerPrefix(name: string): string {
  return name.replace(/^(handle|on|_on|_handle)([A-Z])/, (_, _prefix, char) => char.toLowerCase());
}

function splitIdentifierWords(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');
}

function describeTrigger(eventName: string, elementText: string | null, handlerName?: string | null): string {
  if (elementText) return `"${elementText}" (${eventName})`;
  if (handlerName) return `${handlerName} (${eventName})`;
  return eventName;
}

function frameworkLabel(framework: FrontendFramework): string {
  return framework[0].toUpperCase() + framework.slice(1);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeParamName(value: string): string {
  const last = lastPathSegment(value);
  const cleaned = last.replace(/[^A-Za-z0-9_$]/g, '_').replace(/^([^A-Za-z_$])/, '_$1');
  return cleaned || 'value';
}

function lastPathSegment(value: string): string {
  return value.split('.').filter(Boolean).at(-1) ?? value;
}

function dedupeFields(fields: FormField[]): FormField[] {
  const seen = new Set<string>();
  return fields.filter(field => {
    if (seen.has(field.name)) return false;
    seen.add(field.name);
    return true;
  });
}

function deduplicate(tools: ExtractedTool[]): ExtractedTool[] {
  const seen = new Set<string>();
  return tools.filter(tool => {
    const key = `${tool.name}:${tool.filePath}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
