import PINO from 'pino'
import AVIO from 'avvio'
import HTTP from 'http'
import ROTR from './router'
import ROTE from './route'
import PLGN from './plugin'
import ERRI from './errio'
import HOOK from './hooks'

export interface ServerOptions {
  connectionTimeout?: number
  keepAliveTimeout?: number
  port?: number
  address?: string
}

export interface SmallifyOptions {
  pino?: PINO.LoggerOptions
  router?: ROTR.RouterOptions
  errio?: ERRI.ErrioOptions
  server?: ServerOptions
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

  route(opts: ROTE.Route, handler?: ROTE.RouteHandler<ROTR.Route>): Smallify

  addHook(name: 'onClose', fn: HOOK.OnCloseCallback): void
  addHook(name: 'onError', fn: HOOK.OnErrorCallback): void
  addHook(name: 'onRoute', fn: ROTE.OnRouteCallback<ROTE.Route>): void
}
