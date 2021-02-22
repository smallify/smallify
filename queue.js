const {
  kQueueRoutes,
  kRouteSmallify,
  kSmallifyRouterPrefix,
  kSmallifyRoutes,
  kSmallifyChildren
} = require('./symbols')

const {
  RouteOptionsError,
  // InjectOptionsError,
  HookCallbackError
} = require('./errors')

const { Route } = require('./route')
const { initRouteProperties } = require('./properties')
const { routeHooks, throwError, onRouteFlow } = require('./hooks')
const { registerRouteFlow } = require('./router')
const { isArrow } = require('extra-function')
const { buildAjvErrorsMsg } = require('./validation')

const FastQ = require('fastq')
const { default: AJV } = require('ajv')
const asyncLib = require('async')

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
  asyncLib.series(
    [onRouteFlow.bind(route), registerRouteFlow.bind(route)],
    e => {
      if (e) {
        throwError(this, e)
      } else {
        done()
      }
    }
  )
}

function attachAvvio () {
  const { $avvio, $log } = this.$root

  $avvio._readyQ.unshift(async () => {
    $avvio._readyQ.pause()
    $log.debug('register routes')
    await activeQueue.call(this.$root, kQueueRoutes)
    $avvio._readyQ.resume()
  })
}

function initQueue () {
  this[kQueueRoutes] = FastQ(this, routerWorker, 1)
  this[kQueueRoutes].pause()
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

  this[kSmallifyRoutes].push(route.url)
  this[kQueueRoutes].push(route)
}

module.exports = {
  initQueue,
  attachAvvio,
  addRoute
}
