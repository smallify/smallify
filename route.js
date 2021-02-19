function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }
}

module.exports = {
  Route
}
