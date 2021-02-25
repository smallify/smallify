const Smallify = require('../index')
const assert = require('assert')

const smallify = Smallify({
  pino: {
    level: 'info'
  }
})

assert(
  smallify.hasContentTypeSerializer('application/json'),
  'root not application/json'
)
assert(smallify.hasContentTypeSerializer('text/plain'), 'root not text/plain')

smallify.register(
  async function (ins1) {
    assert(
      ins1.hasContentTypeSerializer('application/json'),
      'ins1 not application/json'
    )
    assert(ins1.hasContentTypeSerializer('text/plain'), 'ins1 not text/plain')

    ins1.addContentTypeSerializer('serializer/ins1', async function (req) {})

    assert(
      ins1.hasContentTypeSerializer('serializer/ins1'),
      'ins1 not serializer/ins1'
    )
    // assert(
    //   ins1.hasContentTypeSerializer('serializer/ins2'),
    //   'ins1 not serializer/ins2'
    // )
  },
  {
    name: 'ins1'
  }
)

smallify.register(
  async function (ins2) {
    assert(
      ins2.hasContentTypeSerializer('application/json'),
      'ins1 not application/json'
    )
    assert(ins2.hasContentTypeSerializer('text/plain'), 'ins1 not text/plain')

    ins2.addContentTypeSerializer('serializer/ins2', async function (req) {})

    assert(
      ins2.hasContentTypeSerializer('serializer/ins2'),
      'ins1 not serializer/ins2'
    )
    assert(
      ins2.hasContentTypeSerializer('serializer/ins1'),
      'ins1 not serializer/ins1'
    )
  },
  {
    name: 'ins2'
  }
)

smallify.ready(async err => {
  err && smallify.$log.error(err.message)
  smallify.print()
})
