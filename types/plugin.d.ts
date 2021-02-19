import { Smallify } from './smallify'

export type PluginDoneCallback = (err?: Error) => void

export interface PluginOptions {
  name?: string
  prefix?: string
  smallify?: string
}

export type PluginCallback = (
  smallify: Smallify,
  opts: PluginOptions,
  done?: PluginDoneCallback
) => PromiseLike<void> | void

export interface SmallifyPlugin<
  Plugin extends PluginCallback = PluginCallback,
  Options extends PluginOptions = PluginOptions
> {
  (plugin: Plugin, opts: Options): Smallify
}
