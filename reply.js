const {
  kReplyRaw,
  kReplySent,
  kReplyHeaders,
  kReplyHasStatusCode,
  kReplyPayload,
  kReplyAllowSend,
  kReplyFlowDone
} = require('./symbols')

const { ReplyAlreadySentError, InvalidStatusCodeError } = require('./errors')

class Reply {
  constructor () {
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
    replyHeaders[key] = value

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

  send (payload) {
    if (this.sent) {
      throw new ReplyAlreadySentError()
    }

    const allowSend = this[kReplyAllowSend]
    if (!allowSend) return

    const contentTypeKey = 'content-type'
    const contentType = this.getHeader(contentTypeKey)
    const hasContentType = contentType !== undefined

    if (Buffer.isBuffer(payload) || typeof payload.pipe === 'function') {
      if (!hasContentType) {
        this.header(contentTypeKey, 'application/octet-stream')
      }
    }

    if (typeof payload === 'string') {
      if (!hasContentType) {
        this.header(contentTypeKey, 'text/plain')
      }
    }

    if (typeof payload === 'object') {
      if (!hasContentType) {
        this.header(contentTypeKey, 'application/json')
      }
    }

    this[kReplyPayload] = payload
    this[kReplyFlowDone]()
  }
}

function initReply (raw) {
  this[kReplyRaw] = raw
  this[kReplySent] = false
  this[kReplyHasStatusCode] = false
  this[kReplyAllowSend] = false
  this[kReplyHeaders] = {}
}

module.exports = {
  Reply,
  initReply
}
