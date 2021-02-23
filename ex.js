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
      schema: {
        response: {
          type: 'object',
          properties: {
            from: {
              type: 'string'
            }
          }
        }
      },
      handler (req, rep) {
        rep.send({ from: 'smallify', prop1: 'this is prop1' })
      }
    })
  },
  { name: 'ins1' }
)

// smallify.addHook('onRequest', function (req, rep) {
//   this.$log.info('do onRequest hook')
// })

// smallify.addHook('onBeforeParsing', function (req, rep) {
//   this.$log.info('do onBeforeParsing hook')
// })

// smallify.addHook('onAfterParsing', function (req, rep) {
//   this.$log.info('do onAfterParsing hook')
// })

// smallify.addHook('onBeforeValidation', function (req, rep) {
//   this.$log.info('do onBeforeValidation hook')
// })

// smallify.addHook('onAfterValidation', function (req, rep) {
//   this.$log.info('do onAfterValidation hook')
// })

// smallify.addHook('onBeforeHandler', function (req, rep) {
//   this.$log.info('do onBeforeHandler hook')
// })

// smallify.addHook('onAfterHandler', function (req, rep) {
//   this.$log.info('do onAfterHandler hook')
// })

// smallify.addHook('onBeforeSerializer', function (req, rep) {
//   this.$log.info('do onBeforeSerializer hook')
// })

smallify.addHook('onAfterSerializer', function (req, rep) {
  this.$log.info('do onAfterSerializer hook')
  const e = new Error('message from onAfterSerializer')
  e.statusCode = 413
  throw e
})

smallify.ready(e => {
  e && smallify.$log.error(e.message)
})
