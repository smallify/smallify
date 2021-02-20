const Smallify = require('./index')

const smallify = Smallify({
  pino: {
    level: 'warn'
  }
})

smallify.register(
  async function (ins1) {
    ins1.route({
      url: '/math/add',
      method: 'POST',
      handler (req, rep) {}
    })
  },
  { name: 'ins1' }
)

smallify.addHook('onRequest', function (req, rep) {
  this.$log.info('do onRequest hook')
})

smallify.addHook('onBeforeParsing', function (req, rep) {
  this.$log.info('do onBeforeParsing hook')
})

smallify.addHook('onAfterParsing', function (req, rep) {
  this.$log.info('do onAfterParsing hook')
})

smallify.ready(e => {
  e && smallify.$log.error(e.message)
})
