const queryString = require('querystring')

const { kRequestRaw, kRequestDecorates } = require('./symbols')

function Request () {
  this[kRequestDecorates] = []
}

Object.defineProperties(Request.prototype, {
  raw: {
    get () {
      return this[kRequestRaw]
    }
  },
  url: {
    get () {
      return this.raw.url
    }
  },
  method: {
    get () {
      return this.raw.method
    }
  },
  socket: {
    get () {
      return this.raw.socket
    }
  },
  headers: {
    get () {
      return this.raw.headers
    }
  },
  ip: {
    get () {
      return this.socket.remoteAddress
    }
  },
  protocol: {
    get () {
      return this.socket.encrypted ? 'https' : 'http'
    }
  },
  hostname: {
    get () {
      return this.headers.host || this.headers[':authority']
    }
  }
})

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
