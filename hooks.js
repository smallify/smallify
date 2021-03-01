const flows = require('./flows')
const { isArrow } = require('extra-function')
const { HookCallbackError } = require('./errors')
const {
  kSmallifyHooks,
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

function Hooks () {
  const hooks = [...routeHooks, ...scopeHooks]
  for (const h of hooks) {
    this[h] = []
  }
}

function noop () {}

function printError (e) {
  this.$log.error(e)
}

function addHook (name, fn) {
  const hooks = this[kSmallifyHooks]
  if (!(name in hooks)) {
    return
  }

  if (isArrow(fn)) {
    const e = new HookCallbackError()
    return runHooks.call(this, 'onError', this, null, e)
  }

  if (typeof fn !== 'function') {
    return
  }

  hooks[name].push(fn)

  return this
}

function runHooks (name, ins, done, ...args) {
  const parent = this[kSmallifyParent]
  done = done || noop

  function _runHooks (err) {
    if (err) {
      return done(err)
    }

    const hooks = this[kSmallifyHooks]

    if (!(name in hooks)) {
      return done()
    }

    const doHooks = [...hooks[name]]
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
        function hookDone (e) {
          doCount++
          next(e)
        }
        try {
          let doHook = doHooks[doCount]
          if (ins) {
            doHook = doHook.bind(ins)
          }
          const pLike = doHook(...args)
          if (pLike && typeof pLike.then === 'function') {
            pLike.then(() => hookDone()).catch(e => hookDone(e))
          } else {
            hookDone()
          }
        } catch (e) {
          hookDone(e)
        }
      },
      done
    )
  }

  if (parent) {
    runHooks.call(parent, name, ins, _runHooks.bind(this), ...args)
  } else {
    _runHooks.call(this)
  }
}

function initHooks () {
  this.addHook = addHook.bind(this)
  this[kSmallifyHooks] = new Hooks()
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
  throwError,
  onRouteFlow,
  onRequestFlow,
  onBeforeValidationFlow: generalLifecycle('onBeforeValidation'),
  onBeforeHandlerFlow: generalLifecycle('onBeforeHandler'),
  onBeforeSerializerFlow: generalLifecycle('onBeforeSerializer'),
  onResponseFlow
}
