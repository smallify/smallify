const {
  kSmallifyParserDict,
  kRouteRequest,
  kSmallifyParent,
  kRequestBody
} = require('./symbols')

const { throwError } = require('./hooks')
const { ContentTypeParserError } = require('./errors')
const { isArrow } = require('extra-function')
const secureJson = require('secure-json-parse')

function rawBody (req) {
  return new Promise((resolve, reject) => {
    const raw = req
    const body = []
    const limit = this.bodyLimit
    const contentLength = raw.headers['content-length']

    let eLen = NaN
    let rLen = 0

    if (contentLength) {
      eLen = Number.parseInt(contentLength, 10)
    }

    function onData (chunk) {
      rLen += chunk.length

      if (rLen > limit) {
        raw.removeListener('data', onData)
        raw.removeListener('end', onEnd)
        raw.removeListener('error', onEnd)

        const err = new ContentTypeParserError('Request body is too large')
        err.statusCode = 413
        return reject(err)
      }

      body.push(chunk)
    }

    function onEnd (err) {
      raw.removeListener('data', onData)
      raw.removeListener('end', onEnd)
      raw.removeListener('error', onEnd)

      if (err) {
        err.statusCode = 400
        return reject(err)
      }

      if (!Number.isNaN(eLen) && eLen !== rLen) {
        err = new ContentTypeParserError(
          'Request body size did not match Content-Length'
        )
        err.statusCode = 400
        return reject(err)
      }

      const nBody = Buffer.concat(body)

      resolve(nBody)
    }

    raw.on('data', onData)
    raw.on('end', onEnd)
    raw.on('error', onEnd)
    raw.resume()
  })
}

function applicationJson (req) {
  return new Promise((resolve, reject) => {
    const body = req.body.toString('utf-8')

    if (body === '' || !body) {
      return resolve({})
    }

    try {
      return resolve(secureJson.parse(body))
    } catch (e) {
      e.statusCode = 400
      return reject(e)
    }
  })
}

function textPlain (req, done) {
  return done(req.body.toString('utf-8'))
}

function addContentTypeParser (contentType, parserFn) {
  if (
    typeof contentType !== 'string' ||
    contentType.length === 0 ||
    typeof parserFn !== 'function' ||
    isArrow(parserFn)
  ) {
    const err = new ContentTypeParserError('contentType parser error')
    return throwError(this, err)
  }

  const parserDict = this[kSmallifyParserDict]

  if (contentType in parserDict) {
    const err = new ContentTypeParserError('contentType parser exists')
    return throwError(this, err)
  }

  // if (contentType === '*') {
  //   contentType = ''
  // }

  parserDict[contentType] = parserFn

  return this
}

function hasContentTypeParser (contentType) {
  const parserDict = this[kSmallifyParserDict]

  if (!(contentType in parserDict)) {
    const parent = this[kSmallifyParent]

    if (parent) {
      return hasContentTypeParser.call(parent, contentType)
    } else {
      return false
    }
  }

  return true
}

function initParser () {
  this[kSmallifyParserDict] = {}
  this.addContentTypeParser = addContentTypeParser.bind(this)
  this.hasContentTypeParser = hasContentTypeParser.bind(this)
}

function attachParser () {
  this.addContentTypeParser('application/json', applicationJson)
  this.addContentTypeParser('text/plain', textPlain)
}

function runParser (contentType, route, done) {
  const parserDict = this[kSmallifyParserDict]

  if (!(contentType in parserDict)) {
    // const parent = this[kSmallifyParent]

    // if (parent) {
    //   return runParser.call(parent, contentType, route, done)
    // } else {
    const err = new ContentTypeParserError(`invalid media type: ${contentType}`)
    return done(err)
    // }
  }

  const parser = parserDict[contentType]
  const req = route[kRouteRequest]

  let hasDone = false
  function parseDone (err, body) {
    if (hasDone) {
      return
    }
    hasDone = true

    if (err) {
      return done(err)
    }
    req[kRequestBody] = body
    done()
  }

  try {
    const pLike = parser.call(route, req, parseDone)

    if (pLike && typeof pLike.then === 'function') {
      pLike.then(body => parseDone(null, body)).catch(e => parseDone(e))
    }
  } catch (e) {
    parseDone(e)
  }
}

function onParsingFlow (next) {
  const { method, $smallify } = this
  const req = this[kRouteRequest]

  if (method === 'GET' || method === 'HEAD') {
    return next()
  }

  let contentType = req.headers['content-type']
  const transferEncoding = req.headers['transfer-encoding']
  const contentLength = req.headers['content-length']

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (contentType === undefined) {
      if (
        transferEncoding === undefined &&
        (contentLength === '0' || contentLength === undefined)
      ) {
        return next()
      } else {
        contentType = ''
      }
    }
    return runParser.call($smallify, contentType, this, next)
  }

  if (method === 'OPTIONS' || method === 'DELETE') {
    if (
      contentType !== undefined &&
      (transferEncoding !== undefined || contentLength !== undefined)
    ) {
      return runParser.call($smallify, contentType, this, next)
    }
  }

  return next()
}

module.exports = {
  initParser,
  attachParser,
  onParsingFlow,
  rawBody
}
