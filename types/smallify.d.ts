import PINO from 'pino'
import AVIO from 'avvio'
import HTTP from 'http'
import { Options } from 'ajv'
import ROTR from './router'
import ROTE from './route'
import PLGN from './plugin'
import ERRI from './errio'
import HOOK from './hooks'
import PSER from './parser'
import SZER from './serializer'
import IJCT from './inject'

export interface ServerOptions {
  connectionTimeout?: number
  keepAliveTimeout?: number
  bodyLimit?: number
  port?: number
  address?: string
}

export interface SmallifyOptions {
  pino?: PINO.LoggerOptions
  router?: ROTR.RouterOptions
  errio?: ERRI.ErrioOptions
  server?: ServerOptions
  ajv?: Options
}

export type SmallifyDoneCallback = () => void

export interface SmallifyAfter<I> {
  (fn: (err: Error) => void): I
  (fn: (err: Error, done: SmallifyDoneCallback) => void): I
  (fn: (err: Error, context: I, done: SmallifyDoneCallback) => void): I
}

export interface SmallifyReady<I> {
  (): Promise<I>
  (fn: (err?: Error) => void): void
  (fn: (err: Error, done: SmallifyDoneCallback) => void): void
  (fn: (err: Error, context: I, done: SmallifyDoneCallback) => void): void
}

export interface SmallifyClose<I> {
  (fn: (err: Error) => void): void
  (fn: (err: Error, done: SmallifyDoneCallback) => void): void
  (fn: (err: Error, context: I, done: SmallifyDoneCallback) => void): void
}

export interface Smallify {
  $root: Readonly<Smallify>
  $name: Readonly<string>
  $options: Readonly<SmallifyOptions>
  $version: Readonly<string>
  $avvio: Readonly<AVIO.Avvio<Smallify>>
  $log: Readonly<PINO.Logger>
  $errio: Readonly<ERRI.Errio>
  $server: Readonly<HTTP.Server>

  // avvio export
  register: PLGN.SmallifyPlugin
  after: SmallifyAfter<Smallify>
  ready: SmallifyReady<Smallify>
  close: SmallifyClose<Smallify>

  decorate(prop: string, value: any): Smallify
  hasDecorator(prop: string): boolean

  decorateRequest(prop: string, value: any): Smallify
  hasRequestDecorator(prop: string): boolean

  decorateReply(prop: string, value: any): Smallify
  hasReplyDecorator(prop: string): boolean

  addContentTypeParser(
    contentType: string,
    parser: PSER.ContentTypeParserCallback
  ): Smallify
  hasContentTypeParser(contentType: string): boolean

  addContentTypeSerializer(
    contentType: string,
    serializer: SZER.ContentTypeSerializerCallback
  ): Smallify
  hasContentTypeSerializer(contentType: string): boolean

  print(): void

  route(opts: ROTE.Route, handler?: ROTE.RouteHandler<ROTR.Route>): Smallify
  inject(
    opts: IJCT.Inject,
    handler?: IJCT.InjectHandler<IJCT.Inject, IJCT.InjectResult>
  ): PromiseLike<IJCT.InjectResult> | void

  addHook(name: 'onClose', fn: HOOK.OnCloseCallback): Smallify
  addHook(name: 'onError', fn: HOOK.OnErrorCallback): Smallify
  addHook(name: 'onRoute', fn: ROTE.OnRouteCallback<ROTE.Route>): Smallify
  addHook(name: 'onRequest', fn: ROTE.OnRequestCallback<ROTE.Route>): Smallify
  addHook(
    name: 'onBeforeValidation',
    fn: ROTE.OnBeforeValidationCallback<ROTE.Route>
  ): Smallify
  addHook(
    name: 'onBeforeHandler',
    fn: ROTE.OnBeforeHandlerCallback<ROTE.Route>
  ): Smallify
  addHook(
    name: 'onBeforeSerializer',
    fn: ROTE.OnBeforeSerializerCallback<ROTE.Route>
  ): Smallify
  addHook(name: 'onResponse', fn: ROTE.OnResponseCallback<ROTE.Route>): Smallify
}
