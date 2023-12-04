import { createUnplugin } from 'unplugin'
import { unpluginFactory } from './core/unplugin'

export * from './types'
export * from './core/unplugin'

export default createUnplugin(unpluginFactory)
