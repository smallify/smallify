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

function sanitizeUrl (url) {
  for (let i = 0, len = url.length; i < len; i++) {
    const charCode = url.charCodeAt(i)
    // string with a `;` character (code 59), e.g. `/foo;jsessionid=123456`.
    // Thus, we need to split on `;` as well as `?` and `#`.
    if (charCode === 63 || charCode === 59 || charCode === 35) {
      return url.slice(0, i)
    }
  }
  return url
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
  const findResult = router.find(req.method, sanitizeUrl(req.url))
  if (!(findResult[0] instanceof Route)) {
    return rep.writeHead(404).end('Not Found')
  }

  const parentRoute = findResult[0]
  const route = Object.create(parentRoute)
  const smallifyReq = new Request(req, findResult[1])
  const smallifyRep = new Reply()

  route[kRouteParent] = parentRoute
  route[kRouteRequest] = smallifyReq
  route[kRouteReply] = smallifyRep

  smallifyReq[kRequestRoute] = route
  smallifyRep[kReplyRoute] = route

  // console.log(smallifyReq.query.a)
  rep.end('is OK')
}

module.exports = {
  registerRouteFlow,
  requestComing
}
