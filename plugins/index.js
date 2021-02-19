const server = require('./server')

module.exports = function () {
  this.register(server, this.$options.server)
}
