// Single source of truth for the CLI version, read from package.json at runtime.
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function readVersion(): string {
  try {
    // dist/version.js → ../package.json after build; src/version.ts → ../package.json
    return (require('../package.json') as { version: string }).version;
  } catch {
    return '1.0.2';
  }
}

export const CLI_VERSION = readVersion();
