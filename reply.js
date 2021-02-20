const { kReplyDecorates } = require('./symbols')

function Reply () {
  this[kReplyDecorates] = []
}

function initReply () {}

module.exports = {
  Reply,
  initReply
}
