const {
  kSmallifyName,
  kSmallifyOptions,
  kSmallifyRoot,
  kSmallifyVersion,
  kSmallifyAvvio,
  kSmallifyPino,
  kSmallifyErrio,
  kSmallifyServer,

  kRouteParent,
  kRouteSmallify
} = require('./symbols')

function initProperties (props) {
  for (const pn in props) {
    Object.defineProperty(this, pn, {
      get () {
        return this[props[pn]]
      }
    })
  }
}

function initLogProperty () {
  Object.defineProperty(this, '$log', {
    get () {
      return this.$smallify.$log
    }
  })
}

module.exports = {
  initSmallifyProperties () {
    const props = {
      $root: kSmallifyRoot,
      $name: kSmallifyName,
      $options: kSmallifyOptions,
      $version: kSmallifyVersion,
      $avvio: kSmallifyAvvio,
      $log: kSmallifyPino,
      $errio: kSmallifyErrio,
      $server: kSmallifyServer
    }
    initProperties.call(this, props)
  },
  initRouteProperties () {
    const props = {
      $parent: kRouteParent,
      $smallify: kRouteSmallify
    }
    initProperties.call(this, props)
    initLogProperty.call(this)
  }
}
