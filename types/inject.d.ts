import { Methods } from './route'

export type InjectHandler<T, R> = (this: T, err: Error, res: R) => void

export interface InjectResult {
  headers: Record<string, string>
  cookies: Record<string, string>
  statusCode: number
  statusMessage: string
  body: string
  rawPayload: Buffer
  json(): Record<string, any>
}

export interface Inject {
  url: string
  method: Methods
  authority?: string
  headers?: Record<string, string>
  cookies?: Record<string, string>
  query: Record<string, string>
  body: any

  $usePrefix?: boolean

  handler?: InjectHandler<Inject, InjectResult>
}
