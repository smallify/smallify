const Smallify = require('../index')
const assert = require('assert')

const smallify = Smallify({
  pino: {
    level: 'info'
  },
  router: {
    prefix: '/root'
  }
})

smallify.register(async function (ins1) {}, {
  name: 'ins1',
  prefix: '/ins1'
})

smallify.register(
  async function (ins2) {
    ins2.register(
      async function (ins3) {
        ins3.route({
          url: '/math/add',
          method: 'GET',
          handler (req, rep) {
            rep.send('ooh!!')
          }
        })
      },
      { name: 'ins3', prefix: '/ins3' }
    )
  },
  {
    name: 'ins2',
    prefix: '/ins2'
  }
)

smallify.ready(async err => {
  err && smallify.$log.error(err.message)
  smallify.print()
  const res1 = await smallify.inject({
    url: '/smallify/ins2/ins3/math/add',
    method: 'GET'
  })
  const res2 = await smallify.inject({
    url: '/math/add',
    method: 'GET'
  })
  assert.ok(res1.body === 'ooh!!', 'prefix work ok')
  assert.ok(res2.body === '404 Not Found', 'prefix work err')
})
