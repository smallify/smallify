const {
  kQueueRoutes,
  kQueueInjects,
  kRouteSmallify,
  kSmallifyRouterPrefix,
  kSmallifyRoutes,
  kSmallifyChildren
} = require('./symbols')

const {
  RouteOptionsError,
  InjectOptionsError,
  HookCallbackError
} = require('./errors')

const { Inject } = require('./inject')
const { Route } = require('./route')
const { initRouteProperties } = require('./properties')
const { routeHooks, throwError, onRouteFlow } = require('./hooks')
const { registerRouteFlow, requestComing } = require('./router')
const { isArrow } = require('extra-function')
const { buildAjvErrorsMsg } = require('./validation')

const FastQ = require('fastq')
const flows = require('./flows')
const { default: AJV } = require('ajv')
const lightMyRequest = require('light-my-request')

const ajv = new AJV({ useDefaults: true, coerceTypes: true })

function noop () {}

function activeQueue (name) {
  return new Promise(resolve => {
    const children = this[kSmallifyChildren]
    const queue = this[name]
    queue.drain = async () => {
      for (const child of children) {
        await activeQueue.call(child, name)
      }
      resolve()
      queue.drain = noop
    }
    queue.resume()
  })
}

function routerWorker (route, done) {
  flows.series([onRouteFlow.bind(route), registerRouteFlow.bind(route)], e => {
    if (e) {
      throwError(this, e)
    } else {
      done()
    }
  })
}

function injectWorker (inject, done) {
  lightMyRequest(requestComing, inject, (err, res) => {
    inject.handler(err, res)
  })
  done()
}

function attachAvvio () {
  const { $avvio, $log } = this.$root

  $avvio._readyQ.unshift(async () => {
    $avvio._readyQ.pause()
    $log.debug('register routes')
    await activeQueue.call(this.$root, kQueueRoutes)
    await activeQueue.call(this.$root, kQueueInjects)
    $avvio._readyQ.resume()
  })
}

function initQueue () {
  this[kQueueRoutes] = FastQ(this, routerWorker, 1)
  this[kQueueRoutes].pause()

  this[kQueueInjects] = FastQ(this, injectWorker, 1)
  this[kQueueInjects].pause()
}

function addRoute (opts, handler) {
  const schema = require('./schemas/route-options.json')
  ajv.compile(schema)(opts)
  if (!ajv.validate(schema, opts)) {
    const e = new RouteOptionsError(buildAjvErrorsMsg(ajv.errors))
    return throwError(this, e)
  }

  const route = new Route(opts)
  route[kRouteSmallify] = this
  initRouteProperties.call(route)

  if (!route.handler && typeof handler === 'function') {
    route.handler = handler
  }

  if (typeof route.handler !== 'function') {
    const e = new RouteOptionsError(
      `missing handler function for ${route.url} route`
    )
    return throwError(this, e)
  }

  if (isArrow(route.handler)) {
    const e = new RouteOptionsError(
      `handler for ${route.url} route not allow arrow function`
    )
    return throwError(this, e)
  }

  for (const hk of routeHooks) {
    if (hk in route) {
      if (typeof route[hk] !== 'function') {
        route[hk] = noop
        break
      }

      if (isArrow(route[hk])) {
        const e = new HookCallbackError()
        return throwError(this, e)
      }
    }
  }

  const prefix = this[kSmallifyRouterPrefix]

  if (route.$usePrefix && prefix && prefix !== '') {
    route.url = `${prefix}${route.url}`
  }

  if (typeof route.bodyLimit !== 'number') {
    const {
      $options: { server }
    } = this

    route.bodyLimit = server.bodyLimit
  }

  this[kSmallifyRoutes].push(`${route.method} ${route.url}`)
  this[kQueueRoutes].push(route)
}

function addInject (opts, handler) {
  const schema = require('./schemas/inject-options.json')
  ajv.compile(schema)(opts)
  if (!ajv.validate(schema, opts)) {
    const e = new InjectOptionsError(buildAjvErrorsMsg(ajv.errors))
    throwError(this, e)
    return this
  }

  const inject = new Inject(opts)

  if (typeof inject.handler !== 'function') {
    delete inject.handler
  }

  if (!inject.handler && typeof handler === 'function') {
    inject.handler = handler
  }

  let returned = this
  if (!inject.handler) {
    returned = new Promise((resolve, reject) => {
      function _handler (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }

      inject.handler = _handler
    })
  }

  if (isArrow(inject.handler)) {
    const e = new InjectOptionsError(
      `handler for ${inject.url} inject not allow arrow function`
    )
    throwError(this, e)
    return returned
  }

  const prefix = this[kSmallifyRouterPrefix]

  if (inject.$usePrefix && prefix && prefix !== '') {
    inject.url = `${prefix}${inject.url}`
  }

  inject.handler = inject.handler.bind(inject)
  this[kQueueInjects].push(inject)
  return returned
}

module.exports = {
  initQueue,
  attachAvvio,
  addRoute,
  addInject
}
