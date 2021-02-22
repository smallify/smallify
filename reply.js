const {
  kReplyDecorates,
  kReplyRaw,
  kReplySent,
  kReplyHeaders,
  kReplyHasStatusCode,
  kReplyPayload
} = require('./symbols')

const { ReplyAlreadySentError, InvalidStatusCodeError } = require('./errors')

class Reply {
  constructor () {
    this[kReplyDecorates] = []
    this[kReplyHeaders] = {}
  }

  get raw () {
    return this[kReplyRaw]
  }

  get sent () {
    return this[kReplySent]
  }

  set sent (value) {
    if (value !== true) {
      return
    }

    if (this[kReplySent]) {
      throw new ReplyAlreadySentError()
    }

    this[kReplySent] = true
  }

  get statusCode () {
    return this.raw.statusCode
  }

  set statusCode (value) {
    this.code(value)
  }

  get payload () {
    return this[kReplyPayload]
  }

  code (statusCode) {
    statusCode = parseInt(statusCode)
    if (isNaN(statusCode) || statusCode < 100 || statusCode > 600) {
      throw new InvalidStatusCodeError(statusCode)
    }

    this.raw.statusCode = statusCode
    this[kReplyHasStatusCode] = true
    return this
  }

  header (key, value) {
    key = key.toLowerCase()
    value = value || ''

    const replyHeaders = this[kReplyHeaders]

    if (replyHeaders[key] && key === 'set-cookie') {
      if (typeof replyHeaders[key] === 'string') {
        replyHeaders[key] = [replyHeaders[key]]
      }
      replyHeaders[key].push(value)
    } else {
      replyHeaders[key] = value
    }

    return this
  }

  headers (obj) {
    const keys = Object.keys(obj)

    for (const k of keys) {
      this.header(k, obj[k])
    }

    return this
  }

  getHeader (key) {
    key = key.toLowerCase()
    const raw = this.raw

    let value = this[kReplyHeaders][key]
    if (!value && raw.hasHeader(key)) {
      value = raw.getHeader(key)
    }

    return value
  }

  getHeaders () {
    return {
      ...this.raw.getHeaders(),
      ...this[kReplyHeaders]
    }
  }

  removeHeader (key) {
    key = key.toLowerCase()
    delete this[kReplyHeaders][key]
    return this
  }

  hasHeader (key) {
    key = key.toLowerCase()
    return key in this[kReplyHeaders]
  }

  redirect (code, destUrl) {
    if (typeof code === 'string') {
      destUrl = code
      code = this[kReplyHasStatusCode] ? this.raw.statusCode : 302
    }

    this.header('location', destUrl)
      .code(code)
      .send()
  }

  notFound () {
    this.code(404).send('404 Not Found')
  }

  type (contentType) {
    this.header('content-type', contentType)
    return this
  }

  send (data) {
    if (this.sent) {
      throw new ReplyAlreadySentError()
    }

    // const contentType = this.getHeader('content-type')
  }

  then (fullfilled, rejected) {}
}

function initReply (raw) {
  this[kReplyRaw] = raw
  this[kReplySent] = false
  this[kReplyHasStatusCode] = false
  this[kReplyHeaders] = {}
}

module.exports = {
  Reply,
  initReply
}
