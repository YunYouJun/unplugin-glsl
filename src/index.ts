import type { TransformResult, UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import type { Options } from './types'

export const DEFAULT_SHADERS = Object.freeze([
  '**/*.glsl', '**/*.wgsl',
  '**/*.vert', '**/*.frag',
  '**/*.vs', '**/*.fs',
])

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const filter = createFilter(
    options?.include ?? DEFAULT_SHADERS,
    options?.exclude ?? [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
  )
  return {
    name: 'unplugin-glsl',
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },
    transform(code, id) {
      const s = new MagicString(code)
      const result: TransformResult = {
        code: `export default ${JSON.stringify(code)}`,
        map: s.generateMap({ hires: 'boundary' }),
      }
      return result
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
