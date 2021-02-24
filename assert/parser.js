const Smallify = require('../index')
const assert = require('assert')

const smallify = Smallify({
  pino: {
    level: 'info'
  }
})

assert(
  smallify.hasContentTypeParser('application/json'),
  'root not application/json'
)
assert(smallify.hasContentTypeParser('text/plain'), 'root not text/plain')

smallify.register(
  async function (ins1) {
    assert(
      ins1.hasContentTypeParser('application/json'),
      'ins1 not application/json'
    )
    assert(ins1.hasContentTypeParser('text/plain'), 'ins1 not text/plain')

    ins1.addContentTypeParser('parser/ins1', async function (req) {})

    assert(ins1.hasContentTypeParser('parser/ins1'), 'ins1 not parser/ins1')
    assert(!ins1.hasContentTypeParser('parser/ins2'), 'ins1 has parser/ins2')
  },
  {
    name: 'ins1'
  }
)

smallify.register(
  async function (ins2) {
    assert(
      ins2.hasContentTypeParser('application/json'),
      'ins1 not application/json'
    )
    assert(ins2.hasContentTypeParser('text/plain'), 'ins1 not text/plain')

    ins2.addContentTypeParser('parser/ins2', async function (req) {})

    assert(ins2.hasContentTypeParser('parser/ins2'), 'ins1 not parser/ins2')
    assert(!ins2.hasContentTypeParser('parser/ins1'), 'ins1 has parser/ins1')
  },
  {
    name: 'ins2'
  }
)

smallify.ready(async err => {
  err && smallify.$log.error(err.message)
  smallify.print()
})
