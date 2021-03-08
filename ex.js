const Smallify = require('./index')

const smallify = Smallify({})

smallify.addHook('onRequest', function h1 () {})
smallify.addHook('onResponse', function h2 () {})

smallify.register(
  async function (ins1) {
    ins1.addHook('onRequest', function h3 () {})
    smallify.addHook('onResponse', function h4 () {})
    ins1
      .register(
        async function (ins2) {
          ins2.addHook('onRequest', function h5 () {
            // throw new Error('onRequest error')
          })
          ins2.route({
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
        { name: 'ins2' }
      )
      .after(() => {
        smallify.addHook('onRequest', function h6 () {})
        ins1.addHook('onRequest', function h7 () {})
        ins1.addHook('onResponse', function h8 () {})
      })
  },
  { name: 'ins1' }
)

smallify.ready(async e => {
  e && smallify.$log.error(e.message)
  // smallify.close()
})
