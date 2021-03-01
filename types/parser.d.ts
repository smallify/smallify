import ROTE from './route'

export type ContentTypeParserDone = (err: Error, body: any) => void

export type ContentTypeParserCallback = (
  this: ROTE.Route,
  req: ROTE.Request,
  done?: ContentTypeParserDone
) => PromiseLike<any> | void
