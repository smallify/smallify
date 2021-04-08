const {
  kRouteRequest,
  kRouteReply,
  kReplyAllowSend,
  kReplyFlowDone
} = require('./symbols')

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
    if (!rep[kReplyAllowSend]) return
    rep[kReplyAllowSend] = false

    next(e)
  }

  try {
    rep[kReplyAllowSend] = true
    rep[kReplyFlowDone] = _done

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
