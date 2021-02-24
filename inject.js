class Inject {
  constructor (opts) {
    for (const k in opts) {
      this[k] = opts[k]
    }
  }
}

module.exports = {
  Inject
}
