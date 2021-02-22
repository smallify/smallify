const TrekRouter = require('trek-router')
const asyncLib = require('async')

const {
  kSmallifyRequest,
  kSmallifyReply,
  kRequestRoute,
  kReplyRoute,
  kRouteParent,
  kRouteRequest,
  kRouteReply
} = require('./symbols')

const {
  throwError,
  onRequestFlow,
  onBeforeParsingFlow,
  onAfterParsingFlow,
  onBeforeValidationFlow,
  onAfterValidationFlow,
  onBeforeHandlerFlow,
  onAfterHandlerFlow
} = require('./hooks')

const { Route, onHandlerFlow } = require('./route')
const { RouteExistsError } = require('./errors')
const { initRequest } = require('./request')
const { initReply } = require('./reply')
const { onParsingFlow, rawBody } = require('./parser')
const { onValidationFlow } = require('./validation')

const router = new TrekRouter()

function parseUrl (url) {
  const queryPrefix = url.indexOf('?')
  if (queryPrefix > -1) {
    return {
      pathname: url.slice(0, queryPrefix),
      query: url.slice(queryPrefix + 1)
    }
  } else {
    return {
      pathname: url,
      query: ''
    }
  }
}

function registerRouteFlow (next) {
  const { url, method, $smallify } = this
  const { $log } = $smallify

  const findResult = router.find(method, url)
  if (findResult[0]) {
    return next(new RouteExistsError(url))
  }

  $log.debug(`route:${method} ${url}`)
  router.add(method, url, this)
  next()
}

function requestComing (req, rep) {
  const { pathname, query } = parseUrl(req.url)
  const findResult = router.find(req.method, pathname)
  if (!(findResult[0] instanceof Route)) {
    return rep.writeHead(404).end('404 Not Found')
  }

  const parentRoute = findResult[0]
  const params = {}
  findResult[1].forEach(pm => {
    params[pm.name] = pm.value
  })

  const route = Object.create(parentRoute)
  const { $smallify } = route

  function onCatch (e) {
    if (!e) return

    rep.writeHead(e.statusCode || 400).end(e.message || '')
    throwError(this, e)
  }

  rawBody
    .call(route, req)
    .then(body => {
      const smallifyReq = Object.create($smallify[kSmallifyRequest])
      const smallifyRep = Object.create($smallify[kSmallifyReply])

      initRequest.call(smallifyReq, req, params, query, body)
      initReply.call(smallifyRep, rep)

      route[kRouteParent] = parentRoute
      route[kRouteRequest] = smallifyReq
      route[kRouteReply] = smallifyRep

      smallifyReq[kRequestRoute] = route
      smallifyRep[kReplyRoute] = route

      asyncLib.series(
        [
          onRequestFlow.bind(route),
          onBeforeParsingFlow.bind(route),
          onParsingFlow.bind(route),
          onAfterParsingFlow.bind(route),
          onBeforeValidationFlow.bind(route),
          onValidationFlow.bind(route),
          onAfterValidationFlow.bind(route),
          onBeforeHandlerFlow.bind(route),
          onHandlerFlow.bind(route),
          onAfterHandlerFlow.bind(route)
        ],
        onCatch.bind($smallify)
      )
    })
    .catch(onCatch.bind($smallify))
}

module.exports = {
  registerRouteFlow,
  requestComing
}
