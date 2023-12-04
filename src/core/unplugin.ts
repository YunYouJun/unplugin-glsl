import process from 'node:process'
import type { TransformResult, UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import type { ModuleNode, ViteDevServer } from 'vite'
import type { Options } from '../types'
import { loadShader } from './loadShader'
import { DEFAULT_EXTENSION, DEFAULT_SHADERS } from './constants'

export const PLUGIN_NAME = 'unplugin:glsl'
export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const {
    include = DEFAULT_SHADERS,
    exclude = undefined,
    warnDuplicatedImports = true,
    defaultExtension = DEFAULT_EXTENSION,
    compress = false,
    watch = true,
    root = '/',
  } = options ?? {}

  const filter = createFilter(
    include ?? defaultExtension,
    exclude ?? [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
  )

  let server: ViteDevServer

  const prod = process.env.NODE_ENV === 'production'

  return {
    name: 'unplugin-glsl',
    enforce: 'pre',

    transformInclude(id) {
      if (id.endsWith('?raw'))
        id = id.slice(0, -4)

      return filter(id)
    },
    transform(code, id) {
      const s = new MagicString(code)
      const result: TransformResult = {
        code: `export default ${JSON.stringify(code)}`,
        map: s.generateMap({ hires: 'boundary' }),
      }

      const { dependentChunks, outputShader } = loadShader(code, id, {
        warnDuplicatedImports,
        defaultExtension,
        compress,
        watch,
        root,
      })

      const { moduleGraph } = server ?? {}
      const module = moduleGraph?.getModuleById(id)
      const chunks = Array.from(dependentChunks.values()).flat()

      if (watch && module && !prod) {
        if (!chunks.length) {
          module.isSelfAccepting = true
        }

        else {
          const imported = new Set<string | ModuleNode>()

          chunks.forEach(chunk => imported.add(
            moduleGraph.createFileOnlyEntry(chunk),
          ))

          moduleGraph.updateModuleInfo(
            module,
            imported,
            null,
            new Set(),
            null,
            true,
          )
        }
      }

      return {
        code: `export default ${JSON.stringify(outputShader)}`,
        map: result.map,
      }
    },

    vite: {
      configureServer(devServer) {
        server = devServer
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
