const queryString = require('querystring')

const {
  kRequestRaw,
  kRequestDecorates,
  kRequestQuery,
  kRequestParams,
  kRequestBody
} = require('./symbols')

class Request {
  constructor () {
    this[kRequestDecorates] = []
  }

  get query () {
    return this[kRequestQuery]
  }

  get params () {
    return this[kRequestParams]
  }

  get body () {
    return this[kRequestBody]
  }

  get raw () {
    return this[kRequestRaw]
  }

  get headers () {
    return this.raw.headers
  }

  get socket () {
    return this.raw.socket
  }

  get ip () {
    return this.socket.remoteAddress
  }

  get protocol () {
    return 'http' // this.socket.encrypted ? 'https' :
  }

  get method () {
    return this.raw.method
  }

  get url () {
    return this.raw.url
  }
}

function initRequest (raw, params, query, body) {
  params = params || {}
  query = queryString.parse(query) || {}

  this[kRequestRaw] = raw
  this[kRequestQuery] = {}
  this[kRequestParams] = params || {}
  this[kRequestBody] = body

  for (const k in query) {
    this.query[k] = query[k]
  }
}

module.exports = {
  Request,
  initRequest
}
