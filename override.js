const {
  kSmallifyName,
  kSmallifyDecorates,
  kSmallifyRoutes,
  kSmallifyChildren,
  kSmallifyRouterPrefix,
  kSmallifyParent,
  kSmallifyRequest,
  kSmallifyReply,

  kSmallifyPluginMeta
} = require('./symbols')

const { PluginVersioMismatchError } = require('./errors')
const { initQueue } = require('./queue')
const { initHooks } = require('./hooks')
const { initParser } = require('./parser')
const { initSerializer } = require('./serializer')

const Merge = require('merge')
const Semver = require('semver')

function initScope () {
  const parent = this[kSmallifyParent]

  if (parent) {
    // root scope parent==null
    const nReq = Object.create(parent[kSmallifyRequest])
    const nRep = Object.create(parent[kSmallifyReply])

    this[kSmallifyRequest] = nReq
    this[kSmallifyReply] = nRep
  }

  this[kSmallifyDecorates] = []
  this[kSmallifyRoutes] = []
  this[kSmallifyChildren] = []
}

function avvioOverride (old, fn, opts) {
  const meta = fn[kSmallifyPluginMeta]

  // merge options
  Merge.recursive(opts, meta || {})

  if (!opts.name) {
    return old
  }

  // check version
  if (opts.smallify && !Semver.satisfies(old.$version, opts.smallify)) {
    throw new PluginVersioMismatchError(opts.name, opts.smallify, old.$version)
  }

  const ins = Object.create(old)
  old[kSmallifyChildren].push(ins)

  ins[kSmallifyParent] = old
  ins[kSmallifyName] = opts.name
  ins[kSmallifyRouterPrefix] = buildRouterPrefix(
    old[kSmallifyRouterPrefix],
    opts.prefix
  )

  initScope.call(ins)
  initParser.call(ins)
  initSerializer.call(ins)
  initHooks.call(ins)
  initQueue.call(ins)

  return ins
}

function buildRouterPrefix (iPrefix, pPrefix) {
  if (!pPrefix || pPrefix === '') {
    return iPrefix
  }

  if (iPrefix === '') {
    return pPrefix || ''
  }

  return `${iPrefix}${pPrefix}`
}

module.exports = {
  avvioOverride,
  initScope
}
