import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: [
    'src/*.ts',
  ],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  onSuccess: 'npm run build:fix',
  // depend by unplugin chokidar
  external: ['picomatch'],
  //   banner: {
  //     // https://github.com/evanw/esbuild/issues/1921
  //     js: `
  // // adapt for cjs
  // if (typeof require !== 'undefined' && typeof __filename !== 'undefined' && typeof __dirname !== 'undefined') {
  //   const require = (await import("node:module")).createRequire(import.meta.url);
  //   const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
  //   const __dirname = (await import("node:path")).dirname(__filename);
  // }
  //     `,
  //   },
})
