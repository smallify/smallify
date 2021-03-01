import ROTE from './route'

export type ContentTypeSerializerDone = (
  err: Error,
  payload: Buffer | string
) => void

export type ContentTypeSerializerCallback = (
  this: ROTE.Route,
  rep: ROTE.Reply,
  done?: ContentTypeSerializerDone
) => PromiseLike<Buffer | string> | void
