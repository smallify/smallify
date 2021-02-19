const {
  kSmallifyRoot,
  kSmallifyName,
  kSmallifyOptions,
  kSmallifyRouterPrefix,
  kSmallifyVersion,
  kSmallifyAvvio,
  kSmallifyDecorates,
  kSmallifyRoutes,
  kSmallifyChildren
} = require('./symbols')

const { DecorateExistsError } = require('./errors')
const { initSmallifyProperties } = require('./properties')
const { initQueue, attachAvvio, addRoute } = require('./queue')
const { initHooks } = require('./hooks')

const smallifyOptions = require('./options')
const smallifyAvvio = require('avvio')
const smallifyOverride = require('./override')
const initSmallifyDecorates = require('./decorates')
const initSmallifyPlugins = require('./plugins')

function Smallify (opts) {
  if (!(this instanceof Smallify)) {
    return new Smallify(opts)
  }

  this[kSmallifyRoot] = this
  this[kSmallifyName] = 'root'
  this[kSmallifyOptions] = smallifyOptions(opts)
  this[kSmallifyRouterPrefix] = opts.router.prefix
  this[kSmallifyVersion] = require('./package.json').version
  this[kSmallifyDecorates] = []
  this[kSmallifyRoutes] = []
  this[kSmallifyChildren] = []
  this[kSmallifyAvvio] = smallifyAvvio(this, {
    expose: {
      use: 'register',
      onClose: '_onClose'
    },
    autostart: true,
    timeout: 15000
  })
  this[kSmallifyAvvio].override = smallifyOverride

  initSmallifyProperties.call(this)
  initSmallifyDecorates.call(this)

  initHooks.call(this)
  initQueue.call(this)
  attachAvvio.call(this)

  initSmallifyPlugins.call(this)
}

Smallify.prototype.decorate = function (prop, value) {
  if (prop in this) {
    throw new DecorateExistsError()
  }

  this[prop] = value
  this[kSmallifyDecorates].push(prop)
  return this
}

Smallify.prototype.hasDecorator = function (prop) {
  return prop in this
}

Smallify.prototype.route = function (opts, handler) {
  addRoute.call(this, opts || {}, handler)
  return this
}

module.exports = Smallify
