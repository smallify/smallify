const pino = require('./pino')
const errio = require('./errio')
const print = require('./print')

module.exports = function () {
  pino.call(this)
  errio.call(this)
  print.call(this)
}
