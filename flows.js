module.exports = {
  series (flows, done) {
    function iterator (i) {
      if (i === flows.length) {
        return done()
      }

      function next (err) {
        if (err) {
          return done(err)
        }

        iterator(i + 1)
      }

      const flowFn = flows[i]
      flowFn(next)
    }
    iterator(0)
  },
  whilst (test, fn, done) {
    function iterator (next) {
      test((err, hasNext) => {
        if (err) {
          return done(err)
        }

        if (hasNext) {
          next()
        } else {
          done()
        }
      })
    }

    function then () {
      fn(err => {
        if (err) {
          return done(err)
        }
        iterator(then)
      })
    }

    iterator(then)
  }
}
