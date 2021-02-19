const queryString = require('querystring')

function Request (raw, params, query) {
  params = params || {}
  query = queryString.parse(query) || {}

  this.raw = raw
  this.params = params || {}
  this.query = {}

  for (const k in query) {
    this.query[k] = query[k]
  }

  this.body = null
}

Object.defineProperties(Request.prototype, {
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
  ip: {
    get () {
      return this.socket.remoteAddress
    }
  },
  hostname: {
    get () {
      return this.raw.headers.host || this.raw.headers[':authority']
    }
  },
  protocol: {
    get () {
      return this.socket.encrypted ? 'https' : 'http'
    }
  },
  headers: {
    get () {
      return this.raw.headers
    }
  }
})

module.exports = Request
