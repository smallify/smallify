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
      method: 'GET',
      handler (req, rep) {
        console.log(this.url)
      }
    })
  },
  { name: 'ins1' }
)

smallify.addHook('onRequest', function (req, rep) {
  this.$log.info('do onRequest hook')
})

smallify.addHook('onBeforeParsing', function (req, rep) {
  this.$log.info('do onBeforeParsing hook')
  const e = new Error('from error')
  e.statusCode = 401
  throw e
})

smallify.addHook('onAfterParsing', function (req, rep) {
  this.$log.info('do onAfterParsing hook')
})

smallify.addHook('onBeforeValidation', function (req, rep) {
  this.$log.info('do onBeforeValidation hook')
})

smallify.addHook('onAfterValidation', function (req, rep) {
  this.$log.info('do onAfterValidation hook')
})

smallify.addHook('onBeforeHandler', function (req, rep) {
  this.$log.info('do onBeforeHandler hook')
})

smallify.addHook('onAfterHandler', function (req, rep) {
  this.$log.info('do onAfterHandler hook')
})

smallify.ready(e => {
  e && smallify.$log.error(e.message)
})
