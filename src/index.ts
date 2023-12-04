import { createUnplugin } from 'unplugin'
import { unpluginFactory } from './core/unplugin'

export * from './types'
export * from './core'

export default createUnplugin(unpluginFactory)
