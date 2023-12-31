import { dirname, extname, posix, resolve, sep } from 'node:path'
import { cwd, emitWarning } from 'node:process'
import { readFileSync } from 'node:fs'
import pc from 'picocolors'
import type { LoadingOptions, LoadingOutput } from '../types'

import {} from 'chalk'

/**
 * @description Shader chunk path
 * that caused a recursion error
 */
let recursiveChunk = ''

/**
 * @name allChunks
 * @type {readonly Set<string>}
 *
 * @description List of all shader chunks,
 * it's used to track included files
 */
const allChunks = new Set<string>()

/**
 * @description Map of shaders that import other chunks, it's
 * used to track included files in order to avoid recursion
 * - Key: shader path that uses other chunks as dependencies
 * - Value: list of chunk paths included within the shader
 */
const dependentChunks = new Map<string, string[]>()

/**
 *
 * @description Map of duplicated shader
 * imports, used by warning messages
 */
const duplicatedChunks = new Map()

/**
 * @description RegEx to match GLSL
 * `#include` preprocessor instruction
 */
const includeRegex: RegExp = /#include(\s+([^\s<>]+));?/gi
const importRegex: RegExp = /@import ([.\/\w_-]+);/gi

/**
 * @description Clears all lists of saved chunks
 * and resets "recursiveChunk" path to empty
 *
 * @returns {string} Copy of "recursiveChunk" path
 */
function resetSavedChunks(): string {
  const chunk = recursiveChunk
  duplicatedChunks.clear()
  dependentChunks.clear()

  recursiveChunk = ''
  allChunks.clear()
  return chunk
}

/**
 * @function
 * @name getRecursionCaller
 * @description Gets last chunk that caused a
 * recursion error from the "dependentChunks" list
 *
 * @returns {string} Chunk path that started a recursion
 */
function getRecursionCaller(): string {
  const dependencies = [...dependentChunks.keys()]
  return dependencies[dependencies.length - 1]
}

/**
 * @function
 * @name checkDuplicatedImports
 * @description Checks if shader chunk was already included
 * and adds it to the "duplicatedChunks" list if yes
 *
 * @param {string} path Shader's absolute path
 *
 * @throws {Warning} If shader chunk was already included
 */
function checkDuplicatedImports(path: string) {
  if (!allChunks.has(path))
    return
  const caller = getRecursionCaller()

  const chunks = duplicatedChunks.get(caller) ?? []
  if (chunks.includes(path))
    return

  chunks.push(path)
  duplicatedChunks.set(caller, chunks)

  emitWarning(`'${path}' was included multiple times.`, {
    code: 'vite-plugin-glsl',
    detail: 'Please avoid multiple imports of the same chunk in order to avoid'
    + ` recursions and optimize your shader length.\nDuplicated import found in file '${caller}'.`,
  })
}

/**
 * @function
 * @name removeSourceComments
 * @description Removes comments from shader source
 * code in order to avoid including commented chunks
 *
 * @param {string} source Shader's source code
 *
 * @returns {string} Shader's source code without comments
 */
function removeSourceComments(source: string) {
  if (source.includes('/*') && source.includes('*/')) {
    source = source.slice(0, source.indexOf('/*'))
    + source.slice(source.indexOf('*/') + 2, source.length)
  }

  const lines = source.split('\n')

  for (let l = lines.length; l--;) {
    if (lines[l].includes('//'))
      lines[l] = lines[l].slice(0, lines[l].indexOf('//'))
  }

  return lines.join('\n')
}

/**
 * @function
 * @name checkRecursiveImports
 * @description Checks if shader dependencies
 * have caused a recursion error or warning
 *
 * @param {string}  path Shader's absolute path
 * @param {boolean} warn Check already included chunks
 *
 * @returns {boolean} Import recursion has occurred
 */
function checkRecursiveImports(path: string, warn: boolean) {
  warn && checkDuplicatedImports(path)
  return checkIncludedDependencies(path, path)
}

/**
 * @function
 * @name checkIncludedDependencies
 * @description Checks if included
 * chunks caused a recursion error
 *
 * @param {string} path Current chunk absolute path
 * @param {string} root Main shader path that imports chunks
 *
 * @returns {boolean} Included chunk started a recursion
 */
function checkIncludedDependencies(path: string, root: string) {
  const dependencies = dependentChunks.get(path)
  let recursiveDependency = false

  if (dependencies?.includes(root)) {
    recursiveChunk = root
    return true
  }

  dependencies?.forEach(dependency => recursiveDependency
    ||= checkIncludedDependencies(dependency, root),
  )

  return recursiveDependency
}

/**
 * @function
 * @name compressShader
 * @description Compresses shader source code by
 * removing unnecessary whitespace and empty lines
 *
 * @param {string}  shader  Shader code with included chunks
 * @param {boolean} newLine Flag to require a new line for the code
 *
 * @returns {string} Compressed shader's source code
 */
export function compressShader(shader: string, newLine = false) {
  return shader.replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g, '')
    .split(/\n+/).reduce((result: string[], line) => {
      line = line.trim().replace(/\s{2,}|\t/, ' ')

      if (line[0] === '#') {
        newLine && result.push('\n')
        result.push(line, '\n')
        newLine = false
      }

      else {
        !line.startsWith('{') && result.length && result[result.length - 1].endsWith('else') && result.push(' ')
        result.push(line.replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|\-|!|;)\s*/g, '$1'))
        newLine = true
      }

      return result
    }, []).join('').replace(/\n+/g, '\n')
}

/**
 * @function
 * @name loadChunks
 * @description Includes shader's dependencies
 * and removes comments from the source code
 *
 * @param {string}  source    Shader's source code
 * @param {string}  path      Shader's absolute path
 * @param {string}  extension Default shader extension
 * @param {boolean} warn      Check already included chunks
 * @param {string}  root      Shader's root directory
 *
 * @throws {Error}   If shader chunks started a recursion loop
 * @returns {string} Shader's source code without external chunks
 */
function loadChunks(source: string, path: string, extension: string, warn: boolean, root: string) {
  const unixPath = path.split(sep).join(posix.sep)

  if (checkRecursiveImports(unixPath, warn))
    return recursiveChunk

  source = removeSourceComments(source)
  let directory = dirname(unixPath)
  allChunks.add(unixPath)

  // @import to include
  const m = source.match(importRegex)
  if (m) {
    const importCode = m[0]
    const targetCode = m[0].replace(importRegex, '#include "$1";')
    console.warn(`\n${pc.yellow(importCode)} ${pc.green('=>')} ${pc.cyan(targetCode)}`)
    source = source.replace(importRegex, '#include "$1";')
  }

  if (includeRegex.test(source)) {
    dependentChunks.set(unixPath, [])
    const currentDirectory = directory

    source = source.replace(includeRegex, (_, chunkPath) => {
      chunkPath = chunkPath.trim().replace(/^(?:"|')?|(?:"|')?;?$/gi, '')

      if (!chunkPath.indexOf('/')) {
        const base = cwd().split(sep).join(posix.sep)
        chunkPath = base + root + chunkPath
      }

      const directoryIndex = chunkPath.lastIndexOf('/')
      directory = currentDirectory

      if (directoryIndex !== -1) {
        directory = resolve(directory, chunkPath.slice(0, directoryIndex + 1))
        chunkPath = chunkPath.slice(directoryIndex + 1, chunkPath.length)
      }

      let shader = resolve(directory, chunkPath)

      if (!extname(shader))
        shader = `${shader}.${extension}`

      const shaderPath = shader.split(sep).join(posix.sep)
      dependentChunks.get(unixPath)?.push(shaderPath)

      return loadChunks(
        readFileSync(shader, 'utf8'),
        shader,
        extension,
        warn,
        root,
      )
    })
  }

  if (recursiveChunk) {
    const caller = getRecursionCaller()
    const recursiveChunk = resetSavedChunks()

    throw new Error(
      `Recursion detected when importing '${recursiveChunk}' in '${caller}'.`,
    )
  }

  return source.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n')
}

/**
 * @description Iterates through all external chunks,
 * includes them into the shader's source code
 * and optionally compresses the output
 *
 * @param {string}         source  Shader's source code
 * @param {string}         shader  Shader's absolute path
 * @param {LoadingOptions} options Configuration object to define:
 *
 *  - warn if the same chunk was imported multiple times
 *  - default shader extension when no extension is specified
 *  - whether (and how) to compress output shader code
 *  - directory for chunk imports from root
 *
 * @returns {LoadingOutput} Loaded, parsed (and compress)
 * shader output and Map of shaders that import other chunks
 */
export function loadShader(source: string, shader: string, options: LoadingOptions): LoadingOutput {
  const {
    warnDuplicatedImports,
    defaultExtension,
    compress,
    root,
  } = options

  resetSavedChunks()

  const output = loadChunks(
    source,
    shader,
    defaultExtension,
    warnDuplicatedImports,
    root,
  )

  return {
    dependentChunks,
    outputShader: compress
      ? typeof compress !== 'function'
        ? compressShader(output)
        : compress(output)
      : output,
  }
}
