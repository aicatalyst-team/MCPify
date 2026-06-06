import { defineConfig } from 'tsup';

// Bundle the CLI into a single self-contained entry. All first-party
// @mcpify/* packages are inlined (noExternal); every third-party dependency
// stays external and is declared in package.json "dependencies", so the
// published package installs them from npm at the user's machine.
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  bundle: true,
  splitting: false,
  dts: false,
  sourcemap: false,
  shims: false,
  // Inline our own workspace packages so the published artifact has no
  // @mcpify/* runtime dependencies. The shebang from src/index.ts is
  // preserved by esbuild, so no banner is needed here.
  noExternal: [/^@mcpify\//],
});
