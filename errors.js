const superError = require('super-error')

const SmallifyError = superError.subclass('SmallifyError')

const DecorateExistsError = SmallifyError.subclass(
  'DecorateExistsError',
  function () {
    this.message = 'Decoration has been already added'
  }
)

const RouteOptionsError = SmallifyError.subclass('RouteOptionsError')

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

module.exports = {
  SmallifyError,
  DecorateExistsError,
  RouteOptionsError,
  HookCallbackError,
  RouteExistsError
}
