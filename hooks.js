const asyncLib = require('async')
const { isArrow } = require('extra-function')
const { HookCallbackError } = require('./errors')

const hooks = {
  onClose: [],
  onRoute: [],
  onError: []
}
const routeHooks = []

function printError (e) {
  this.$log.error(e)
}

function addHook (name, fn) {
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

  let doCount = 0
  asyncLib.whilst(
    function (next) {
      next(null, doCount < doHooks.length)
    },
    function (next) {
      function done (e) {
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
          pLike.then(() => done()).catch(e => done(e))
        } else {
          done()
        }
      } catch (e) {
        done(e)
      }
    },
    function (err) {
      if (done) {
        done(err)
      }
    }
  )
}

function runHooksAsync (name, ins, ...args) {
  return new Promise((resolve, reject) => {
    runHooks(
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
  this.$log.info('decorate addHook')
  this.addHook = addHook.bind(this)

  this._onClose((ins, done) => {
    runHooks('onClose', ins, done)
  })
  this.addHook('onError', printError)
}

function throwError (ins, e) {
  runHooks('onError', ins, null, e)
}

function onRouteFlow (next) {
  const { $smallify } = this
  runHooksAsync('onRoute', $smallify, this)
    .then(() => next())
    .catch(e => next(e))
}

module.exports = {
  initHooks,
  routeHooks,
  throwError,
  onRouteFlow
}
