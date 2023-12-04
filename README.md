# unplugin-glsl

[![NPM version](https://img.shields.io/npm/v/unplugin-glsl?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-glsl)

Starter template for [unplugin](https://github.com/unjs/unplugin).

## Usage

```bash
pnpm add unplugin-glsl
```

### With TypeScript

Add extension declarations to your [`types`](https://www.typescriptlang.org/tsconfig#types) in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": [
      "vite-plugin-glsl/ext"
    ]
  }
}
```

or as a [package dependency directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) to your global types:

```ts
/// <reference types="vite-plugin-glsl/ext" />
```

### Default Options

```ts
glsl({
  include: [ // Glob pattern, or array of glob patterns to import
    '**/*.glsl',
    '**/*.wgsl',
    '**/*.vert',
    '**/*.frag',
    '**/*.vs',
    '**/*.fs'
  ],
  exclude: undefined, // Glob pattern, or array of glob patterns to ignore
  warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
  defaultExtension: 'glsl', // Shader suffix when no extension is specified
  compress: false, // Compress output shader code
  watch: true, // Recompile shader on change
  root: '/' // Directory for root imports
})
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import GLSL from 'unplugin-glsl/vite'

export default defineConfig({
  plugins: [
    GLSL({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import GLSL from 'unplugin-glsl/rollup'

export default {
  plugins: [
    GLSL({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
const glsl = require('unplugin-glsl/webpack').default

module.exports = {
  /* ... */
  plugins: [
    glsl({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['unplugin-glsl/nuxt', { /* options */ }],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import GLSL from 'unplugin-glsl/esbuild'

build({
  plugins: [GLSL()],
})
```

<br></details>

## Why unplugin-glsl?

We need `@import` in [webpack-glsl-loader](https://www.npmjs.com/package/webpack-glsl-loader#imports), which is not supported in [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl).

And uniform performance across different build tools.

- See [Closed | feat: Added support for @import](https://github.com/UstymUkhman/vite-plugin-glsl/pull/45)

## Dev

- Install: `pnpm i`
- Dev: `pnpm run dev`
- Release: `pnpm run release`

## Todo

- [ ] Test Webpack/Rollup/Nuxt/esbuild/RSpack

## Ref

- [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl)
