const pino = require('./pino')
const errio = require('./errio')
// const server = require('./server')

module.exports = function () {
  pino.call(this)
  errio.call(this)
  // server.call(this)
}
