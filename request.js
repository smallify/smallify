const queryString = require('querystring')

const { kRequestRaw, kRequestDecorates } = require('./symbols')

class Request {
  constructor () {
    this[kRequestDecorates] = []
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
  this.params = params || {}
  this.query = {}
  for (const k in query) {
    this.query[k] = query[k]
  }

  this.body = body
}

module.exports = {
  Request,
  initRequest
}
