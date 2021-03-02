const TrekRouter = require('trek-router')
const eos = require('readable-stream').finished
const flows = require('./flows')

const {
  kSmallifyRequest,
  kSmallifyReply,
  kRequestRoute,
  kReplyRoute,
  kRouteParent,
  kRouteRequest,
  kRouteReply,
  kReplyHeaders
} = require('./symbols')

const {
  throwError,
  onRequestFlow,
  onBeforeValidationFlow,
  onBeforeHandlerFlow,
  onBeforeSerializerFlow,
  onResponseFlow
} = require('./hooks')

const { Route, onHandlerFlow } = require('./route')
const { RouteExistsError } = require('./errors')
const { initRequest } = require('./request')
const { initReply } = require('./reply')
const { onParsingFlow, rawBody } = require('./parser')
const { onValidationFlow } = require('./validation')
const { onSerializerFlow } = require('./serializer')

const router = new TrekRouter()

function noop () {}

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

function sendStream () {
  const rep = this[kRouteReply]
  const { $smallify } = this
  const { raw, payload } = rep

  let sourceOpen = true
  eos(payload, { readable: true, writable: false }, function (err) {
    sourceOpen = false
    if (err) {
      raw.destroy()
      throwError($smallify, err)
    }
  })

  eos(raw, function (err) {
    if (err) {
      if (sourceOpen) {
        if (payload.destroy) {
          payload.destroy()
        } else if (typeof payload.close === 'function') {
          payload.close(noop)
        } else if (typeof payload.abort === 'function') {
          payload.abort()
        }
      }
      throwError($smallify, err)
    }
  })

  const headers = rep[kReplyHeaders]
  for (const key in headers) {
    raw.setHeader(key, headers[key])
  }

  payload.pipe(raw)
}

function sendResponseFlow (next) {
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]

  if (rep.sent) {
    return next()
  }

  const raw = rep.raw
  const statusCode = rep.statusCode
  let payload = rep.payload

  if (payload && typeof payload.pipe === 'function') {
    sendStream.call(this)
    return next()
  }

  if (payload === null || payload === undefined) {
    if (
      statusCode >= 200 &&
      statusCode !== 204 &&
      statusCode !== 304 &&
      req.method !== 'HEAD'
    ) {
      rep.header('content-length', '0')
    }

    payload = null
  }

  if (Buffer.isBuffer(payload) && !rep.hasHeader('content-length')) {
    rep.header('content-length', Buffer.byteLength(payload))
  }

  rep.sent = true
  raw.writeHead(statusCode, rep[kReplyHeaders])
  raw.end(payload, null, null)
  return next()
}

function requestComing (req, rep) {
  const { pathname, query } = parseUrl(req.url)
  const findResult = router.find(req.method, pathname)
  if (!(findResult[0] instanceof Route)) {
    return rep.writeHead(404).end('404 Not Found')
  }

  const parentRoute = findResult[0]
  const { $smallify } = parentRoute
  const params = {}
  findResult[1].forEach(pm => {
    params[pm.name] = pm.value
  })

  const route = Object.create(parentRoute)
  const smallifyReq = Object.create($smallify[kSmallifyRequest])
  const smallifyRep = Object.create($smallify[kSmallifyReply])

  route[kRouteParent] = parentRoute
  route[kRouteRequest] = smallifyReq
  route[kRouteReply] = smallifyRep

  smallifyReq[kRequestRoute] = route
  smallifyRep[kReplyRoute] = route

  initRequest.call(smallifyReq, req, params, query)
  initReply.call(smallifyRep, rep)

  function onCatch (e) {
    if (!e) return

    smallifyRep.sent = true
    e.statusCode = e.statusCode || 400

    const headers = smallifyRep[kReplyHeaders]
    delete headers['content-type']
    delete headers['content-length']

    rep.writeHead(e.statusCode, headers).end(
      JSON.stringify({
        statusCode: e.statusCode,
        code: e.statusCode + '',
        message: e.message,
        error: e.message
      })
    )
    throwError(this, e)
  }

  function fixedBind (obj) {
    for (const k in obj) {
      const v = obj[k]
      if (typeof v === 'function') {
        obj[k] = v.bind(obj)
      }
    }
  }

  rawBody
    .call(route, req)
    .then(route => {
      const req = route[kRouteRequest]
      const rep = route[kRouteReply]

      // fixed bind
      fixedBind(req)
      fixedBind(rep)

      flows.series(
        [
          onRequestFlow.bind(route),
          onParsingFlow.bind(route),
          onBeforeValidationFlow.bind(route),
          onValidationFlow.bind(route),
          onBeforeHandlerFlow.bind(route),
          onHandlerFlow.bind(route),
          onBeforeSerializerFlow.bind(route),
          onSerializerFlow.bind(route),
          onResponseFlow.bind(route),
          sendResponseFlow.bind(route)
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
