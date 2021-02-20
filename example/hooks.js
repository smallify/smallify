const Smallify = require('../index')
// const { kSmallifyParent } = require('../symbols')

const smallify = Smallify({
  pino: {
    level: 'warn'
  }
})

function routeTest (m) {
  return function (route) {
    route.msg = route.msg || ''
    route.msg += m
    // if (m === '2') {
    //   throw new Error('from routeTest')
    // }
  }
}

smallify.addHook('onRoute', routeTest('1'))

smallify.register(
  async function (ins1) {
    ins1.addHook('onRoute', routeTest('2'))

    ins1.register(
      async function (ins2) {
        ins2.addHook('onRoute', routeTest('3'))
        ins2.route({
          url: '/math/add',
          method: 'GET',
          handler (req, rep) {
            console.log({
              msg: this.msg,
              version: this.$smallify.$version
            })
            // console.log({ ins2, parent: ins2[kSmallifyParent] })
          }
        })
      },
      { name: 'ins2' }
    )

    ins1.register(
      async function (ins3) {
        ins3.addHook('onRoute', routeTest('4'))
        ins3.route({
          url: '/math/:sub',
          method: 'GET',
          handler (req, rep) {
            console.log({
              msg: this.msg,
              version: this.$smallify.$version
            })
          }
        })
      },
      { name: 'ins3' }
    )
  },
  { name: 'ins1' }
)

smallify.ready(e => {
  e && smallify.$log.error(e.message)
})
