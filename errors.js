const superError = require('super-error')

const SmallifyError = superError.subclass('SmallifyError')

const DecorateExistsError = SmallifyError.subclass(
  'DecorateExistsError',
  function () {
    this.message = 'Decoration has been already added'
  }
)

const RouteOptionsError = SmallifyError.subclass('RouteOptionsError')
const InjectOptionsError = SmallifyError.subclass('InjectOptionsError')

const HookCallbackError = SmallifyError.subclass(
  'HookCallbackError',
  function () {
    this.message = 'hook callback not allow arrow function'
  }
)

const RouteExistsError = SmallifyError.subclass('RouteExistsError', function (
  url
) {
  this.message = `The route has been registered : ${url}`
})

const PluginVersioMismatchError = SmallifyError.subclass(
  'PluginVersioMismatchError',
  function (name, expected, installed) {
    this.message = `smallify-plugin: ${name} - expected '${expected}' smallify version, '${installed}' is installed`
  }
)

const ContentTypeParserError = SmallifyError.subclass(
  'ContentTypeParserError',
  function (message) {
    this.message = message
  }
)

const ContentTypeSerializerError = SmallifyError.subclass(
  'ContentTypeSerializerError',
  function (message) {
    this.message = message
  }
)

const ReplyAlreadySentError = SmallifyError.subclass(
  'ReplyAlreadySentError',
  function () {
    this.message = 'Reply was already sent.'
  }
)

const InvalidStatusCodeError = SmallifyError.subclass(
  'InvalidStatusCodeError',
  function (code) {
    this.message = `Called reply with an invalid status code: ${code}`
  }
)

module.exports = {
  SmallifyError,
  DecorateExistsError,
  RouteOptionsError,
  InjectOptionsError,
  HookCallbackError,
  RouteExistsError,
  PluginVersioMismatchError,
  ContentTypeParserError,
  ReplyAlreadySentError,
  InvalidStatusCodeError,
  ContentTypeSerializerError
}
