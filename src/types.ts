export type GlobPattern = string | string[]

export type Options = {
  // define your plugin options here
  include?: GlobPattern
  exclude?: GlobPattern
} & Partial<LoadingOptions>

/**
 * @default false
 * @description Boolean value or custom callback
 * function to optimize output shader length
 *
 * @param {string} shader Shader code with included chunks
 *
 * @returns {string} Compressed shader's source code
 */
type Compress = boolean | ((shader: string) => string)

/**
 * @name LoadingOptions
 * @description Shader loading config object
 *
 * @property {boolean}  warnDuplicatedImports Warn if the same chunk was imported multiple times
 * @property {string}   defaultExtension      Shader suffix when no extension is specified
 * @property {Compress} compress              Compress output shader code
 * @property {boolean}  watch                 Recompile shader on change
 * @property {string}   root                  Directory for root imports
 */
export interface LoadingOptions {
  warnDuplicatedImports: boolean
  defaultExtension: string
  compress: Compress
  watch: boolean
  root: string
}

/**
 * @name PluginOptions
 * @extends LoadingOptions
 * @description Plugin config object
 *
 * @default {
 *   exclude: undefined,
 *   include: DEFAULT_SHADERS,
 *   warnDuplicatedImports: true,
 *   defaultExtension: DEFAULT_EXTENSION,
 *   compress: false,
 *   watch: true,
 *   root: '/'
 * }
 */
export type PluginOptions = Partial<LoadingOptions> & {
  include?: GlobPattern
  exclude?: GlobPattern
}

/**
 * @since 1.1.2
 * @name LoadingOutput
 * @description Loaded, parsed (and compress) shader
 * output and Map of shaders that import other chunks
 *
 * @property {Map<string, string[]>} dependentChunks Map of shaders that import other chunks
 * @property {string}                outputShader    Shader file with included chunks
 */
export interface LoadingOutput {
  dependentChunks: Map<string, string[]>
  outputShader: string
}
