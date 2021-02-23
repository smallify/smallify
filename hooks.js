const asyncLib = require('async')
const { isArrow } = require('extra-function')
const { HookCallbackError } = require('./errors')
const {
  kSmallifyHooks,
  kSmallifyParent,
  kRouteRequest,
  kRouteReply,
  kRouteSpan
} = require('./symbols')

const routeHooks = []

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
    return runHooks('onError', this, null, e)
  }

  if (typeof fn !== 'function') {
    return
  }

  hooks[name].push(fn)
}

function runHooks (name, ins, done, ...args) {
  const parent = this[kSmallifyParent]

  function _runHooks (err) {
    if (err) {
      return done && done(err)
    }

    const hooks = this[kSmallifyHooks]

    if (!(name in hooks)) {
      return done && done()
    }

    const doHooks = [...hooks[name]]
    if (ins && name in ins) {
      const insHook = ins[name]
      if (typeof insHook === 'function') {
        doHooks.push(insHook)
      }
    }

    let doCount = 0
    asyncLib.whilst(
      function (next) {
        next(null, doCount < doHooks.length)
      },
      function (next) {
        function _done (e) {
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
            pLike.then(() => done()).catch(e => _done(e))
          } else {
            _done()
          }
        } catch (e) {
          _done(e)
        }
      },
      function (err) {
        done && done(err)
      }
    )
  }

  if (parent) {
    runHooks.call(parent, name, ins, _runHooks.bind(this), ...args)
  } else {
    _runHooks.call(this)
  }
}

function runHooksAsync (name, ins, ...args) {
  return new Promise((resolve, reject) => {
    runHooks.call(
      this,
      name,
      ins,
      err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
      ...args
    )
  })
}

function initHooks () {
  this.addHook = addHook.bind(this)
  this[kSmallifyHooks] = {
    onClose: [],
    onError: [],

    onRoute: [],

    onRequest: [],
    onBeforeParsing: [],
    onAfterParsing: [],
    onBeforeValidation: [],
    onAfterValidation: [],
    onBeforeHandler: [],
    onAfterHandler: [],
    onBeforeSerializer: [],
    onAfterSerializer: [],
    onResponse: []
  }
}

function attachHooks () {
  this._onClose((ins, done) => {
    runHooks('onClose', ins, done)
  })
  this.addHook('onError', printError)
}

function throwError (ins, e) {
  runHooks.call(ins, 'onError', ins, null, e)
}

function onRouteFlow (next) {
  const { $smallify } = this
  runHooksAsync
    .call($smallify, 'onRoute', $smallify, this)
    .then(() => next())
    .catch(e => next(e))
}

function generalLifecycle (hookName) {
  return function (next) {
    const { $smallify } = this
    const req = this[kRouteRequest]
    const rep = this[kRouteReply]

    runHooksAsync
      .call($smallify, hookName, this, req, rep)
      .then(() => next())
      .catch(e => next(e))
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
  onBeforeParsingFlow: generalLifecycle('onBeforeParsing'),
  onAfterParsingFlow: generalLifecycle('onAfterParsing'),
  onBeforeValidationFlow: generalLifecycle('onBeforeValidation'),
  onAfterValidationFlow: generalLifecycle('onAfterValidation'),
  onBeforeHandlerFlow: generalLifecycle('onBeforeHandler'),
  onAfterHandlerFlow: generalLifecycle('onAfterHandler'),
  onBeforeSerializerFlow: generalLifecycle('onBeforeSerializer'),
  onAfterSerializerFlow: generalLifecycle('onAfterSerializer'),
  onResponseFlow
}
