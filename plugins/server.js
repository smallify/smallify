const { Server } = require('http')

const { kSmallifyServer } = require('../symbols')
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

  const server = new Server()
  server.keepAliveTimeout = keepAliveTimeout
  server.setTimeout(connectionTimeout)
  this[kSmallifyServer] = server

  server.once('error', done)
  server.on('request', requestComing)

  server.listen(port, address, () => {
    const address = ensureServerAddress.call(this)
    $log.info('server listening at ' + address)
    server.removeListener('error', done)
    done()
  })
}
