const TrekRouter = require('trek-router')
// const asyncLib = require('async')

const {
  kRequestRoute,
  kReplyRoute,
  kRouteParent,
  kRouteRequest,
  kRouteReply
} = require('./symbols')

const { Route } = require('./route')
const { RouteExistsError } = require('./errors')
const Request = require('./request')
const Reply = require('./reply')

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

  $log.info(`route: ${url}`)
  router.add(method, url, this)
  next()
}

function requestComing (req, rep) {
  const { pathname, query } = parseUrl(req.url)
  const findResult = router.find(req.method, pathname)
  if (!(findResult[0] instanceof Route)) {
    return rep.writeHead(404).end('Not Found')
  }

  const parentRoute = findResult[0]
  const params = {}
  findResult[1].forEach(pm => {
    params[pm.name] = pm.value
  })

  const route = Object.create(parentRoute)
  const smallifyReq = new Request(req, params, query)
  const smallifyRep = new Reply()

  route[kRouteParent] = parentRoute
  route[kRouteRequest] = smallifyReq
  route[kRouteReply] = smallifyRep

  smallifyReq[kRequestRoute] = route
  smallifyRep[kReplyRoute] = route

  console.log(smallifyReq.query)
  console.log(smallifyReq.params)
  rep.end('is OK')
}

module.exports = {
  registerRouteFlow,
  requestComing
}
