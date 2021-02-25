module.exports = {
  series (flows, done) {
    function _next (i) {
      if (i === flows.length) {
        return done()
      }

      function _done (err) {
        if (err) {
          return done(err)
        }

        _next(i + 1)
      }

      const flowFn = flows[i]
      flowFn(_done)
    }
    process.nextTick(() => {
      _next(0)
    })
  },
  whilst (test, fn, done) {
    function doTest (next) {
      test((err, hasNext) => {
        if (err) {
          return next(err)
        }

        if (hasNext) {
          next()
        } else {
          done()
        }
      })
    }

    function doFn (err) {
      if (err) {
        return done(err)
      }

      fn(err => {
        if (err) {
          return done(err)
        }
        doTest(doFn)
      })
    }

    doTest(doFn)
  }
}
