const fastJsonStringify = require('fast-json-stringify')
const {
  kSmallifySerializerDict,
  kRouteReply,
  kSmallifyParent,
  kReplyPayload
} = require('./symbols')
const { kSerializerPayload } = require('./symbols')
const { ContentTypeSerializerError } = require('./errors')
const { isArrow } = require('extra-function')
const { throwError } = require('./hooks')

function applicationJson (rep, done) {
  let serializerCall = this[kSerializerPayload]
  if (!serializerCall) {
    serializerCall = JSON.stringify
  }
  const payload = serializerCall(rep.payload)
  rep.header('content-length', payload.length)
  return done(null, payload)
}

function textPlain (rep, done) {
  const payload = rep.payload
  rep.header('content-length', payload.length)
  return done(null, payload)
}

function attachSerializer () {
  this.addHook('onRoute', function (route) {
    const {
      $smallify: {
        $options: { ajv }
      }
    } = route
    const schema = route.schema
    if (!schema || !schema.response) return
    route[kSerializerPayload] = fastJsonStringify(schema.response, {
      ajv
    })
  })

  // this.addHook('onAfterSerializer', function (req, rep) {
  //   rep.header('X-Powered-By', 'smallify')
  // })

  this.addContentTypeSerializer('application/json', applicationJson)
  this.addContentTypeSerializer('text/plain', textPlain)
}

function addContentTypeSerializer (contentType, serializerFn) {
  if (
    typeof contentType !== 'string' ||
    contentType.length === 0 ||
    typeof serializerFn !== 'function' ||
    isArrow(serializerFn)
  ) {
    const err = new ContentTypeSerializerError('contentType serializer error')
    return throwError(this, err)
  }

  const serializerDict = this[kSmallifySerializerDict]

  if (contentType in serializerDict) {
    const err = new ContentTypeSerializerError('contentType serializer exists')
    return throwError(this, err)
  }

  serializerDict[contentType] = serializerFn

  return this
}

function hasContentTypeSerializer (contentType) {
  const serializerDict = this[kSmallifySerializerDict]

  if (!(contentType in serializerDict)) {
    const parent = this[kSmallifyParent]

    if (parent) {
      return hasContentTypeSerializer.call(parent, contentType)
    } else {
      return false
    }
  }

  return true
}

function runSerializer (contentType, route, done) {
  const serializerDict = this[kSmallifySerializerDict]

  if (!(contentType in serializerDict)) {
    // const parent = this[kSmallifyParent]

    // if (parent) {
    //   return runSerializer.call(parent, contentType, route, done)
    // } else {
    return done()
    // }
  }

  const serializer = serializerDict[contentType]
  const rep = route[kRouteReply]

  let hasDone = false
  function serializeDone (err, payload) {
    if (hasDone) {
      return
    }
    hasDone = true

    if (err) {
      return done(err)
    }
    rep[kReplyPayload] = payload
    done()
  }

  try {
    const pLike = serializer.call(route, rep, serializeDone)

    if (pLike && typeof pLike.then === 'function') {
      pLike
        .then(payload => serializeDone(null, payload))
        .catch(e => serializeDone(e))
    }
  } catch (e) {
    serializeDone(e)
  }
}

function initSerializer () {
  this[kSmallifySerializerDict] = {}
  this.addContentTypeSerializer = addContentTypeSerializer.bind(this)
  this.hasContentTypeSerializer = hasContentTypeSerializer.bind(this)
}

function onSerializerFlow (next) {
  const { $smallify } = this
  const rep = this[kRouteReply]
  const contentType = rep.getHeader('content-type')

  if (!contentType) {
    return next()
  }

  runSerializer.call($smallify, contentType, this, next)
}

module.exports = {
  initSerializer,
  attachSerializer,
  onSerializerFlow
}
