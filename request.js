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

module.exports = Request
