import PINO from 'pino'
import HTTP from 'http'
import NET from 'net'
import { JSONSchemaType } from 'ajv'
import { Smallify } from './smallify'

declare type Known =
  | Record<string, any>
  | [any, ...any[]]
  | any[]
  | number
  | string
  | boolean
  | null

export type Methods =
  | 'HEAD'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'OPTIONS'
  | 'DELETE'

export interface Request {
  query: Readonly<Record<string, unknown>>
  params: Readonly<Record<string, unknown>>
  body: Readonly<Buffer | any>
  raw: Readonly<HTTP.IncomingMessage>
  headers: Readonly<HTTP.IncomingHttpHeaders>
  socket: Readonly<NET.Socket>
  remoteAddress: Readonly<string>
  protocol: Readonly<string>
  method: Readonly<string>
  url: Readonly<string>
}

export interface Reply {
  raw: Readonly<HTTP.ServerResponse>
  sent: boolean
  statusCode: number
  payload: any

  code(statusCode: number | string): Reply
  type(contentType: string): Reply

  header(key: string, value: string): Reply
  headers(obj: Record<string, string>): Reply
  removeHeader(key: string): Reply
  getHeader(key: string): string
  getHeaders(): Record<string, string>
  hasHeader(key: string): boolean

  redirect(destUrl: string): void
  redirect(code: number, destUrl: string): void
  notFound(): void

  send(payload: any): Reply
}

export type RouteHandler<S> = (
  this: S,
  req: Request,
  rep?: Reply
) => Promise<any> | void

export type OnRouteCallback<S> = (
  this: Smallify,
  route: S
) => Promise<void> | void

export type OnRequestCallback<T> = (
  this: T,
  req: Request,
  rep: Reply
) => Promise<void> | void

export type OnBeforeValidationCallback<T> = (
  this: T,
  req: Request,
  rep: Reply
) => Promise<void> | void

export type OnBeforeHandlerCallback<T> = (
  this: T,
  req: Request,
  rep: Reply
) => Promise<void> | void

export type OnBeforeSerializerCallback<T> = (
  this: T,
  req: Request,
  rep: Reply
) => Promise<void> | void

export type OnResponseCallback<T> = (
  this: T,
  req: Request,
  rep: Reply
) => Promise<void> | void

export interface SchemaOptions {
  params: JSONSchemaType<Record<string, Known>>
  query: JSONSchemaType<Record<string, Known>>
  body: JSONSchemaType<Known>
  response: JSONSchemaType<Known>
}

export interface Route {
  // options
  url: string
  method: Methods
  schema?: SchemaOptions
  bodyLimit?: number
  $usePrefix?: boolean
  handler?: RouteHandler<Route>

  // properties
  $parent: Readonly<Route>
  $smallify: Readonly<Smallify>
  $log: Readonly<PINO.Logger>

  // hooks
  onRequest?: OnRequestCallback<Route>
  onBeforeValidation?: OnBeforeValidationCallback<Route>
  onBeforeHandler?: OnBeforeHandlerCallback<Route>
  onBeforeSerializer?: OnBeforeSerializerCallback<Route>
  onResponse?: OnResponseCallback<Route>
}
