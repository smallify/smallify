const Smallify = require('../index')
const assert = require('assert')

const smallify = Smallify({
  pino: {
    level: 'info'
  }
})

smallify.decorate('root', 1)
smallify.decorate('scopeRoot', 1)
smallify.decorateRequest('reqRoot', 1)
smallify.decorateRequest('reqScopeRoot', 1)
smallify.decorateReply('repRoot', 1)
smallify.decorateReply('repScopeRoot', 1)

smallify.register(
  async function (ins1) {
    ins1.decorate('scopeRoot', 2)
    assert.ok(ins1.hasDecorator('root'), 'ins1 not exist root')
    assert.ok(ins1.hasDecorator('scopeRoot'), 'ins1 not exist scopeRoot')
    assert.ok(ins1.scopeRoot === 2, 'ins1.scopeRoot!==2')

    ins1.decorateRequest('reqScopeRoot', 2)
    assert.ok(
      ins1.hasRequestDecorator('reqRoot'),
      'ins1 request not exist root'
    )
    assert.ok(
      ins1.hasRequestDecorator('reqScopeRoot'),
      'ins1 request not exist scopeRoot'
    )

    assert.ok(ins1.hasReplyDecorator('repRoot'), 'ins1 reply not exist root')
    assert.ok(
      ins1.hasReplyDecorator('repScopeRoot'),
      'ins1 reply not exist scopeRoot'
    )

    ins1.route({
      url: '/math/add',
      method: 'GET',
      handler (req, rep) {
        assert.ok(req.reqRoot === 1, 'req.reqRoot!==1')
        assert.ok(req.reqScopeRoot === 2, 'req.reqScopeRoot!==2')
        assert.ok(rep.repRoot === 1, 'req.repRoot!==1')
        assert.ok(rep.repScopeRoot === 1, 'req.repScopeRoot!==1')
        rep.send('math.add')
      }
    })
  },
  {
    name: 'ins1'
  }
)

smallify.register(
  async function (ins2) {
    ins2.decorateReply('repScopeRoot', 2)

    assert.ok(ins2.hasDecorator('root'), 'ins2 not exist root')
    assert.ok(ins2.hasDecorator('scopeRoot'), 'ins2 not exist scopeRoot')
    assert.ok(ins2.scopeRoot === 1, 'ins2.scopeRoot!==1') // use parent scopeRoot

    assert.ok(
      ins2.hasRequestDecorator('reqRoot'),
      'ins2 request not exist root'
    )
    assert.ok(
      ins2.hasRequestDecorator('reqScopeRoot'),
      'ins2 request not exist scopeRoot'
    )

    assert.ok(ins2.hasReplyDecorator('repRoot'), 'ins2 reply not exist root')
    assert.ok(
      ins2.hasReplyDecorator('repScopeRoot'),
      'ins2 reply not exist scopeRoot'
    )

    ins2.route({
      url: '/math/sub',
      method: 'GET',
      handler (req, rep) {
        assert.ok(req.reqRoot === 1, 'req.reqRoot!==1')
        assert.ok(req.reqScopeRoot === 1, 'req.reqScopeRoot!==1')
        assert.ok(rep.repRoot === 1, 'req.repRoot!==1')
        assert.ok(rep.repScopeRoot === 2, 'req.repScopeRoot!==2')
        rep.send('math.sub')
      }
    })

    ins2.register(
      async function (ins3) {
        ins3.decorateRequest('reqScopeRoot', 3)

        assert.ok(ins3.hasDecorator('root'), 'ins3 not exist root')
        assert.ok(ins3.hasDecorator('scopeRoot'), 'ins3 not exist scopeRoot')
        assert.ok(ins3.scopeRoot === 1, 'ins3.scopeRoot!==1') // use parent scopeRoot

        assert.ok(
          ins3.hasRequestDecorator('reqRoot'),
          'ins3 request not exist root'
        )
        assert.ok(
          ins3.hasRequestDecorator('reqScopeRoot'),
          'ins3 request not exist scopeRoot'
        )

        assert.ok(
          ins3.hasReplyDecorator('repRoot'),
          'ins3 reply not exist root'
        )
        assert.ok(
          ins3.hasReplyDecorator('repScopeRoot'),
          'ins3 reply not exist scopeRoot'
        )

        ins3.route({
          url: '/math/power',
          method: 'GET',
          handler (req, rep) {
            assert.ok(req.reqRoot === 1, 'req.reqRoot!==1')
            assert.ok(req.reqScopeRoot === 3, 'req.reqScopeRoot!==1')
            assert.ok(rep.repRoot === 1, 'req.repRoot!==1')
            assert.ok(rep.repScopeRoot === 2, 'req.repScopeRoot!==2')
            rep.send('math.power')
          }
        })
      },
      { name: 'ins3' }
    )
  },
  {
    name: 'ins2'
  }
)

smallify.ready(async err => {
  err && smallify.$log.error(err.message)
  smallify.print()
  await smallify.inject({ url: '/math/add', method: 'GET' })
  await smallify.inject({ url: '/math/sub', method: 'GET' })
  await smallify.inject({ url: '/math/power', method: 'GET' })
})
