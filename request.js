// const queryString = require('querystring')

function Request (raw, params) {
  // this.raw = raw
  // const queryPrefix = raw.url.indexOf('?')
  // this.query = queryString.parse(
  //   queryPrefix > -1 ? raw.url.slice(queryPrefix + 1) : ''
  // )
  // this.params = {}
  // params.forEach(pm => {
  //   this.params[pm.name] = pm.value
  // })
  // this.body = null
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
