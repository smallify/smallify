import { Smallify } from './smallify'

export type MethodEnum = 'GET' | 'POST'

export interface Request {
  [key: string]: any
}

export interface Reply {
  [key: string]: any
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

export interface Route {
  // options
  url: string
  method: MethodEnum
  bodyLimit?: number
  $usePrefix?: boolean
  handler?: RouteHandler<Route>

  // properties
  $parent: Route
}
