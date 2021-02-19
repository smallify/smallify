const Pino = require('pino')
const { kSmallifyPino } = require('../symbols')
module.exports = function () {
  const pino = Pino(this.$options.pino)
  this[kSmallifyPino] = pino
}
