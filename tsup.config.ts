import { defineConfig } from 'tsup'

export default defineConfig(({ format }) => {
  return {
    entryPoints: [
      'src/*.ts',
    ],
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
    onSuccess: 'npm run build:fix',
    banner: {
      // https://github.com/evanw/esbuild/issues/1921
      js: format === 'esm'
        ? `
      const require = (await import("node:module")).createRequire(import.meta.url);
      const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
      const __dirname = (await import("node:path")).dirname(__filename);
      `
        : '',
    },
  }
})
