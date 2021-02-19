const http = require('http')

const { kSmallifyServer, kServerListening } = require('../symbols')
const { requestComing } = require('../router')

function ensureServerAddress () {
  const server = this[kSmallifyServer]
  let address = server.address()
  const isUnixSocket = typeof address === 'string'
  if (!isUnixSocket) {
    if (address.address.indexOf(':') === -1) {
      address = address.address + ':' + address.port
    } else {
      address = '[' + address.address + ']:' + address.port
    }
  }
  address = (isUnixSocket ? '' : 'http' + '://') + address
  return address
}

module.exports = function (smallify, opts, done) {
  const { $log } = smallify
  const { keepAliveTimeout, connectionTimeout, port, address } = opts

  const server = http.createServer((req, rep) => {
    if (this[kServerListening] === true) {
      requestComing.call(smallify, req, rep)
    }
  })

  server.keepAliveTimeout = keepAliveTimeout
  server.setTimeout(connectionTimeout)

  this[kServerListening] = false
  this[kSmallifyServer] = server

  function onError (err) {
    done(err)
  }

  server.once('error', onError)
  server.listen(port, address, () => {
    const address = ensureServerAddress.call(this)
    $log.info('server listening at ' + address)
    server.removeListener('error', onError)
    this[kServerListening] = true
    done()
  })
}
