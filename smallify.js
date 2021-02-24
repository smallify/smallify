const {
  kSmallifyRoot,
  kSmallifyName,
  kSmallifyOptions,
  kSmallifyRouterPrefix,
  kSmallifyVersion,
  kSmallifyAvvio,
  kSmallifyDecorates,
  kSmallifyParent,
  kSmallifyRequest,
  kSmallifyReply,
  kRequestDecorates,
  kReplyDecorates
} = require('./symbols')

const { DecorateExistsError } = require('./errors')
const { initSmallifyProperties } = require('./properties')
const { attachAvvio, initQueue, addRoute, addInject } = require('./queue')
const { attachHooks, initHooks } = require('./hooks')
const { attachParser, initParser } = require('./parser')
const { attachSerializer, initSerializer } = require('./serializer')
const { attachValidation } = require('./validation')

const smallifyOptions = require('./options')
const smallifyAvvio = require('avvio')
const { avvioOverride, initScope } = require('./override')
const initSmallifyDecorates = require('./decorates')
const initSmallifyPlugins = require('./plugins')

const { Request } = require('./request')
const { Reply } = require('./reply')

function Smallify (opts) {
  if (!(this instanceof Smallify)) {
    return new Smallify(opts)
  }

  this[kSmallifyRoot] = this
  this[kSmallifyName] = 'root'
  this[kSmallifyOptions] = smallifyOptions(opts)
  this[kSmallifyRouterPrefix] = opts.router.prefix
  this[kSmallifyVersion] = require('./package.json').version

  this[kSmallifyParent] = null
  this[kSmallifyRequest] = new Request()
  this[kSmallifyReply] = new Reply()

  initScope.call(this)

  this[kSmallifyAvvio] = smallifyAvvio(this, {
    expose: {
      use: 'register',
      onClose: '_onClose'
    },
    autostart: true,
    timeout: 15000
  })
  this[kSmallifyAvvio].override = avvioOverride

  initSmallifyProperties.call(this)
  initSmallifyDecorates.call(this)

  initParser.call(this)
  initSerializer.call(this)
  initHooks.call(this)
  initQueue.call(this)

  attachParser.call(this)
  attachValidation.call(this)
  attachSerializer.call(this)
  attachHooks.call(this)
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

Smallify.prototype.decorateRequest = function (prop, value) {
  const req = this[kSmallifyRequest]

  if (prop in req) {
    throw new DecorateExistsError()
  }

  req[prop] = value
  req[kRequestDecorates].push(prop)
  return this
}

Smallify.prototype.hasRequestDecorator = function (prop) {
  const req = this[kSmallifyRequest]

  return prop in req
}

Smallify.prototype.decorateReply = function (prop, value) {
  const rep = this[kSmallifyReply]

  if (prop in rep) {
    throw new DecorateExistsError()
  }

  rep[prop] = value
  rep[kReplyDecorates].push(prop)
  return this
}

Smallify.prototype.hasReplyDecorator = function (prop) {
  const rep = this[kSmallifyReply]

  return prop in rep
}

Smallify.prototype.route = function (opts, handler) {
  addRoute.call(this, opts || {}, handler)
  return this
}

Smallify.prototype.inject = function (opts, handler) {
  return addInject.call(this, opts || {}, handler)
}

module.exports = Smallify
