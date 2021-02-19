import { Smallify, SmallifyOptions } from './types/smallify'

declare function factory (options: SmallifyOptions): Smallify

export = factory

export {
  ServerOptions,
  SmallifyOptions,
  Smallify,
  SmallifyDoneCallback,
  SmallifyAfter,
  SmallifyReady,
  SmallifyClose
} from './types/smallify'

export {
  HookDoneCallback,
  OnCloseCallback,
  OnErrorCallback
} from './types/hooks'

export { RouterOptions } from './types/router'

export {
  PluginDoneCallback,
  PluginOptions,
  PluginCallback,
  SmallifyPlugin
} from './types/plugin'
