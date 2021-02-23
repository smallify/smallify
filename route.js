const { kRouteRequest, kRouteReply, kReplyAllowSend } = require('./symbols')

function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }
}

function onHandlerFlow (next) {
  const { handler } = this
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]

  function _done (e) {
    rep[kReplyAllowSend] = false
    next(e)
  }

  try {
    rep[kReplyAllowSend] = true
    const pLike = handler.call(this, req, rep)
    if (pLike && typeof pLike.then === 'function') {
      pLike.then(() => _done()).catch(e => _done(e))
    } else {
      _done()
    }
  } catch (e) {
    _done(e)
  }
}

module.exports = {
  Route,
  onHandlerFlow
}
