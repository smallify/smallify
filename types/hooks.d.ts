import { Smallify } from './smallify'

export type HookDoneCallback = (err?: Error) => void

export type OnCloseCallback = (this: Smallify) => Promise<void> | void

export type OnErrorCallback = (
  this: Smallify,
  err: Error
) => Promise<void> | void
