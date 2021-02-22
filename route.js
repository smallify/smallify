const { kRouteRequest, kRouteReply } = require('./symbols')

function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }
}

function onHandlerFlow (next) {
  const { handler } = this
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]
  try {
    const pLike = handler.call(this, req, rep)
    if (pLike && typeof pLike.then === 'function') {
      pLike.then(() => next()).catch(e => next(e))
    } else {
      next()
    }
  } catch (e) {
    next(e)
  }
}

module.exports = {
  Route,
  onHandlerFlow
}
