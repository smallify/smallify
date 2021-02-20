const {
  kSmallifyParserDict,
  kRouteRequest,
  kRouteReply,
  kSmallifyParent
} = require('./symbols')
const { throwError } = require('./hooks')
const { ContentTypeParserError } = require('./errors')
const { isArrow } = require('extra-function')

function rawBody (req, rep) {
  return new Promise((resolve, reject) => {
    const raw = req.raw
    const limit = this.bodyLimit
    const contentLength = req.headers['content-length']

    let eLen = NaN
    let rLen = 0
    let body = ''

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

      body += chunk
    }

    function onEnd (err) {
      console.log({
        err
      })
      raw.removeListener('data', onData)
      raw.removeListener('end', onEnd)
      raw.removeListener('error', onEnd)

      if (err) {
        err.statusCode = 400
        return reject(err)
      }

      console.log({
        eLen,
        rLen,
        body
      })

      if (!Number.isNaN(eLen) && eLen !== rLen) {
        err = new ContentTypeParserError(
          'Request body size did not match Content-Length'
        )
        err.statusCode = 400
        return reject(err)
      }

      resolve(body)
    }

    // raw.setEncoding('utf8')
    raw.on('data', onData)
    raw.on('end', onEnd)
    raw.on('error', onEnd)
    raw.resume()

    // console.log(raw)
  })
}

function applicationJson (req, rep) {
  return rawBody.call(this, req, rep).then(body => {
    console.log(body)
  })
}

function textPlain (req, rep) {
  return rawBody.call(this, req, rep).then(body => {})
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

  if (contentType === '*') {
    contentType = ''
  }

  parserDict[contentType] = parserFn

  return this
}

function initParser () {
  this[kSmallifyParserDict] = {}
  this.addContentTypeParser = addContentTypeParser.bind(this)
}

function attachParser () {
  this.addContentTypeParser('application/json', applicationJson)
  this.addContentTypeParser('text/plain', textPlain)
}

function runParser (contentType, route, done) {
  const parserDict = this[kSmallifyParserDict]

  if (!(contentType in parserDict)) {
    const parent = this[kSmallifyParent]

    if (parent) {
      return runParser.call(parent, contentType, route, done)
    } else {
      const err = new ContentTypeParserError(
        `invalid media type: ${contentType}`
      )
      return done(err)
    }
  }

  try {
    const parser = parserDict[contentType]
    const req = route[kRouteRequest]
    const rep = route[kRouteReply]
    const pLike = parser.call(route, req, rep)

    if (pLike && typeof pLike.then === 'function') {
      pLike.then(() => done()).catch(e => done(e))
    } else {
      done()
    }
  } catch (e) {
    done(e)
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
  onParsingFlow
}
