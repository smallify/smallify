const { kRouteRequest, kRouteReply, kReplyAllowSend } = require('./symbols')

function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }
}

function onHandlerFlow (next) {
  const { handler, $log, url } = this
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]

  let hasDone = false

  function _done (e) {
    if (hasDone) return
    hasDone = true

    rep[kReplyAllowSend] = false
    rep.off('sent', _done)
    next(e)
  }

  try {
    rep[kReplyAllowSend] = true
    rep.once('sent', _done)

    const pLike = handler.call(this, req, rep)
    if (pLike && typeof pLike.then === 'function') {
      pLike
        .then(payload => {
          if (payload !== null && payload !== undefined) {
            rep.send(payload)
          } else if (rep.sent === false) {
            const msg = `Promise may not be fulfilled with 'undefined' when statusCode is not 204; url: ${url}`
            $log.warn(msg)
          }
          _done()
        })
        .catch(e => _done(e))
    }
  } catch (e) {
    _done(e)
  }
}

module.exports = {
  Route,
  onHandlerFlow
}
