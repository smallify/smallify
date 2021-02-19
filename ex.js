const Smallify = require('./index')

const smallify = Smallify({
  pino: {
    level: 'warn'
  }
})

// smallify.register(async () => {})

smallify.route({
  url: '/math/add',
  method: 'GET',
  handler (req, rep) {}
})

smallify.ready(e => {
  smallify.$log.info('aaaaaaaaaa')
  e && smallify.$log.error(e.message)
})
