import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { compressShader, loadShader } from '../src/core/loadShader'
import { DEFAULT_EXTENSION } from '../src'

const fixturePath = path.resolve(__dirname, './fixture')

describe('glsl', () => {
  it('load shader', () => {
    expect(1).toBe(1)

    const mainShaderPath = path.resolve(__dirname, '../playground/glsl/main.frag')
    const mainShader = fs.readFileSync(mainShaderPath, 'utf-8')
    const { outputShader } = loadShader(mainShader, mainShaderPath, {
      warnDuplicatedImports: true,
      compress: true,
      watch: true,
      defaultExtension: DEFAULT_EXTENSION,
      root: '/playground/',
    })

    const expectedShaderPath = path.resolve(fixturePath, './result.frag')
    const expectedShader = fs.readFileSync(expectedShaderPath, 'utf-8')
    expect(outputShader).toEqual(compressShader(expectedShader))
  })
})
