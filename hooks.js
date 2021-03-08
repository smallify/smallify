const flows = require('./flows')
const { isArrow } = require('extra-function')
const { HookCallbackError } = require('./errors')
const {
  kSmallifyFullname,
  kSmallifyLevel,
  kSmallifyChildren,
  kHookLevel,
  kSmallifyParent,
  kRouteRequest,
  kRouteReply,
  kRouteSpan
} = require('./symbols')

const routeHooks = [
  'onRequest',
  'onBeforeValidation',
  'onBeforeHandler',
  'onBeforeSerializer',
  'onResponse'
]

const scopeHooks = ['onClose', 'onError', 'onRoute']

const hooks = {}

function noop () {}

function printError (e) {
  this.$log.error(e)
}

function addHook (name, fn) {
  if (typeof fn !== 'function') {
    return this
  }

  if (isArrow(fn)) {
    const e = new HookCallbackError()
    runHooks.call(this, 'onError', this, null, e)
    return this
  }

  if (fn[kHookLevel] === undefined) {
    fn[kHookLevel] = this[kSmallifyLevel]
  }
  const children = this[kSmallifyChildren]
  const fullname = this[kSmallifyFullname]
  const hName = `${fullname}.${name}`

  if (!(hName in hooks)) {
    hooks[hName] = []
  }

  for (const c of children) {
    c.addHook(name, fn)
  }

  hooks[hName].push(fn)
  hooks[hName] = hooks[hName].sort((a, b) => {
    return a[kHookLevel] - b[kHookLevel]
  })

  return this
}

function runHooks (name, ins, done, ...args) {
  done = done || noop

  const fullname = this[kSmallifyFullname]
  const hName = `${fullname}.${name}`

  if (!(hName in hooks)) {
    return done()
  }

  const doHooks = [...hooks[hName]]
  if (ins && name in ins) {
    const insHook = ins[name]
    if (typeof insHook === 'function') {
      doHooks.push(insHook)
    }
  }

  if (doHooks.length === 0) {
    return done()
  }

  let doCount = 0
  flows.whilst(
    function (next) {
      next(null, doCount < doHooks.length)
    },
    function (next) {
      function doNext (e) {
        doCount++
        next(e)
      }
      try {
        const doHook = doHooks[doCount]
        const pLike = doHook.call(ins, ...args)
        if (pLike && typeof pLike.then === 'function') {
          pLike.then(() => doNext()).catch(e => doNext(e))
        } else {
          doNext()
        }
      } catch (e) {
        doNext(e)
      }
    },
    done
  )
}

function initHooks () {
  this.addHook = addHook.bind(this)

  const parent = this[kSmallifyParent]

  if (!parent) {
    return
  }

  const hookNames = [...scopeHooks, ...routeHooks]
  const fullname = this[kSmallifyFullname]
  const parentFullname = parent[kSmallifyFullname]

  for (const hName of hookNames) {
    const parentHook = hooks[`${parentFullname}.${hName}`]
    if (Array.isArray(parentHook)) {
      hooks[`${fullname}.${hName}`] = [...parentHook]
    }
  }
}

function attachHooks () {
  this._onClose((ins, done) => {
    runHooks.call(ins, 'onClose', ins, done)
  })
  this.addHook('onError', printError)
}

function throwError (ins, e) {
  runHooks.call(ins, 'onError', ins, null, e)
}

function onRouteFlow (next) {
  const { $smallify } = this
  runHooks.call($smallify, 'onRoute', $smallify, next, this)
}

function generalLifecycle (hookName) {
  return function (next) {
    const { $smallify } = this
    const req = this[kRouteRequest]
    const rep = this[kRouteReply]
    runHooks.call($smallify, hookName, this, next, req, rep)
  }
}

function hasLifecycle (hookName) {
  const { $smallify } = this

  const fullname = $smallify[kSmallifyFullname]
  const hName = `${fullname}.${hookName}`
  const hookItems = hooks[hName]

  return Array.isArray(hookItems) && hookItems.length > 0
}

function onRequestFlow (next) {
  const now = Date.now()
  const { $log } = this

  $log.debug(`request incoming(${now}): ${this.url}`)
  this[kRouteSpan] = now

  generalLifecycle('onRequest').call(this, next)
}

function onResponseFlow (next) {
  const now = Date.now()
  const span = this[kRouteSpan]

  const { $log } = this
  $log.debug(`request complete(${now}): ${this.url}`)
  $log.info(`request during(${now - span} ms): ${this.url}`)

  generalLifecycle('onResponse').call(this, next)
}

module.exports = {
  initHooks,
  attachHooks,
  routeHooks,
  scopeHooks,
  throwError,

  hasHook: hasLifecycle,

  onRouteFlow,
  onRequestFlow,
  onBeforeValidationFlow: generalLifecycle('onBeforeValidation'),
  onBeforeHandlerFlow: generalLifecycle('onBeforeHandler'),
  onBeforeSerializerFlow: generalLifecycle('onBeforeSerializer'),
  onResponseFlow
}
