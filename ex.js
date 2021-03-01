const Smallify = require('./index')

const smallify = Smallify({})

smallify.addHook('onRequest', function () {})
smallify.addHook('onResponse', function () {})

smallify.register(
  async function (ins1) {
    ins1.route({
      url: '/',
      method: 'GET',
      schema: {
        response: {
          type: 'object',
          properties: {
            hello: {
              type: 'string'
            }
          }
        }
      },
      handler (req, rep) {
        rep.send({ hello: 'world' })
      }
    })
  },
  { name: 'ins1' }
)

smallify.ready(async e => {
  e && smallify.$log.error(e.message)
  smallify.print()
  smallify.close()
})
