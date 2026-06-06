// ─────────────────────────────────────────────────────────────────────────────
// ui.ts  —  shared CLI theme: brand colors, banner, boxes, symbols, spinners.
//
// Centralizes all presentation so every command shares one consistent look.
// Truecolor degrades gracefully on terminals without 24-bit support (chalk).
// ─────────────────────────────────────────────────────────────────────────────

import chalk from 'chalk';
import ora, { type Ora } from 'ora';

// ── Brand palette ─────────────────────────────────────────────────────────────

export const brand = {
  violet: chalk.hex('#8B5CF6'),
  cyan:   chalk.hex('#22D3EE'),
  green:  chalk.hex('#34D399'),
  yellow: chalk.hex('#FBBF24'),
  red:    chalk.hex('#F87171'),
  gray:   chalk.hex('#9CA3AF'),
  dim:    chalk.dim,
};

// ── Symbols (ASCII-safe glyphs that render on Windows Terminal/VS Code) ─────────

export const sym = {
  ok:      brand.green('✓'),
  warn:    brand.yellow('▲'),
  err:     brand.red('✗'),
  skip:    brand.gray('○'),
  arrow:   brand.gray('→'),
  bullet:  brand.gray('•'),
  bolt:    brand.violet('⚡'),
};

// ── ANSI-aware width helpers ────────────────────────────────────────────────────

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\[[0-9;]*m/g;

function visibleWidth(s: string): number {
  return stripAnsi(s).length;
}

export function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}

// ── Banner ───────────────────────────────────────────────────────────────────

/**
 * The MCPify header. `subtitle` describes the active command, `version` is
 * stamped on the right when provided.
 */
export function banner(subtitle: string, version?: string): string {
  const title = brand.violet.bold('MCPify');
  const tag   = brand.gray('— ' + subtitle);
  const ver   = version ? brand.gray(`v${version}`) : '';
  const left  = `  ${sym.bolt}  ${title} ${tag}`;
  // Pad so the version sits toward the right edge (best-effort, width 64).
  const pad   = Math.max(1, 64 - visibleWidth(left) - visibleWidth(ver));
  return '\n' + left + ' '.repeat(pad) + ver + '\n';
}

// ── Boxes ──────────────────────────────────────────────────────────────────────

export interface BoxOptions {
  title?: string;
  lines:  string[];
  color?: (s: string) => string;
  /** Inner padding width; box auto-sizes to the widest line otherwise. */
  minWidth?: number;
}

const TL = '╭', TR = '╮', BL = '╰', BR = '╯', H = '─', V = '│';

/** Render a rounded box around `lines`, with an optional inline title. */
export function box(opts: BoxOptions): string {
  const paint  = opts.color ?? brand.violet;
  const inner  = Math.max(
    opts.minWidth ?? 0,
    ...opts.lines.map(visibleWidth),
    opts.title ? visibleWidth(opts.title) + 2 : 0
  );
  const pad = 2; // left+right inner padding

  const top = opts.title
    ? paint(TL + H + ' ') + chalk.bold(opts.title) + paint(' ' + H.repeat(Math.max(0, inner - visibleWidth(opts.title) - 1) + pad - 2) + TR)
    : paint(TL + H.repeat(inner + pad) + TR);

  const body = opts.lines.map(line => {
    const fill = ' '.repeat(Math.max(0, inner - visibleWidth(line)));
    return paint(V) + ' ' + line + fill + ' ' + paint(V);
  });

  const bottom = paint(BL + H.repeat(inner + pad) + BR);

  return ['  ' + top, ...body.map(b => '  ' + b), '  ' + bottom].join('\n');
}

// ── Section header ──────────────────────────────────────────────────────────────

export function section(label: string): string {
  return '\n  ' + chalk.bold.white(label);
}

// ── Spinners ──────────────────────────────────────────────────────────────────

export function step(text: string): Ora {
  return ora({ text: brand.gray(text), prefixText: '  ', spinner: 'dots' }).start();
}

export function stepDone(spinner: Ora, text: string): void {
  spinner.succeed(brand.dim(text));
}

export function stepWarn(spinner: Ora, text: string): void {
  spinner.warn(brand.yellow(text));
}

export function stepFail(spinner: Ora, text: string): void {
  spinner.fail(brand.red(text));
}

// ── Permission styling ──────────────────────────────────────────────────────────

export type Permission = 'SAFE' | 'REQUIRES_CONFIRMATION' | 'BLOCKED' | string;

export function permColor(permission: Permission): (s: string) => string {
  switch (permission) {
    case 'SAFE':                  return brand.green;
    case 'REQUIRES_CONFIRMATION': return brand.yellow;
    case 'BLOCKED':               return brand.red;
    default:                      return brand.gray;
  }
}

export function permBadge(permission: Permission): string {
  switch (permission) {
    case 'SAFE':                  return brand.green('● SAFE   ');
    case 'REQUIRES_CONFIRMATION': return brand.yellow('● CONFIRM');
    case 'BLOCKED':               return brand.red('● BLOCKED');
    default:                      return brand.gray('● ' + permission);
  }
}
