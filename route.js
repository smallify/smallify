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

  function _done (e) {
    rep[kReplyAllowSend] = false
    next(e)
  }

  try {
    rep[kReplyAllowSend] = true
    const pLike = handler.call(this, req, rep)
    if (pLike && typeof pLike.then === 'function') {
      pLike
        .then(payload => {
          if (payload) {
            rep.send(payload)
          } else {
            const msg = `Promise may not be fulfilled with 'undefined' when statusCode is not 204; url: ${url}`
            $log.warn(msg)
          }
          _done()
        })
        .catch(e => _done(e))
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
