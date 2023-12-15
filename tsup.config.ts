import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: [
    'src/*.ts',
  ],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  onSuccess: 'npm run build:fix',
  banner: {
    // https://github.com/evanw/esbuild/issues/1921
    js: `
// adapt for commonjs
if (typeof require === 'undefined' && typeof __filename === 'undefined' && typeof __dirname === 'undefined') {
  var require = (await import("node:module")).createRequire(import.meta.url);
  var __filename = (await import("node:url")).fileURLToPath(import.meta.url);
  var __dirname = (await import("node:path")).dirname(__filename);
}
    `,
  },
})
