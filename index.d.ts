import { Smallify, SmallifyOptions } from './types/smallify'

declare function factory (options: SmallifyOptions): Smallify

export = factory

export {
  ServerOptions,
  SmallifyOptions,
  SmallifyDoneCallback,
  SmallifyAfter,
  SmallifyReady,
  SmallifyClose,
  Smallify
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

export { InjectHandler, InjectResult, Inject } from './types/inject'

export {
  ContentTypeParserDone,
  ContentTypeParserCallback
} from './types/parser'

export {
  Methods,
  Request,
  Reply,
  RouteHandler,
  OnRouteCallback,
  OnRequestCallback,
  OnBeforeValidationCallback,
  OnBeforeHandlerCallback,
  OnBeforeSerializerCallback,
  OnResponseCallback,
  SchemaOptions,
  Route
} from './types/route'

export {
  ContentTypeSerializerDone,
  ContentTypeSerializerCallback
} from './types/serializer'
