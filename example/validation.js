const Smallify = require('../index')

const smallify = Smallify({
  pino: {
    level: 'warn'
  }
})

smallify.route({
  url: '/math/:action',
  method: 'GET',
  schema: {
    params: {
      type: 'object',
      properties: {
        action: {
          type: 'string'
        }
      }
    },
    query: {
      type: 'object',
      properties: {
        a: {
          type: 'string'
        }
      }
    }
  },
  handler (req, rep) {}
})

smallify.ready(e => {
  e && smallify.$log.error(e.message)
})
