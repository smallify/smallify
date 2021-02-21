// const { default: AJV } = require('ajv')
const {
  kValidationParams,
  kValidationQuery,
  kValidationBody,
  kValidationResponse

  // kRouteRequest
} = require('./symbols')

function compileSchema (schema, prop, field) {
  console.log(prop)
}

function buildAjvErrorsMsg (errs) {
  const es = []
  errs.forEach(e => {
    es.push(`schema path: [${e.schemaPath}] message: ${e.message}`)
  })
  return es.join('\n')
}

function attachValidation () {
  this.addHook('onRoute', function (route) {
    const schema = route.schema
    if (!schema) return

    compileSchema.call(route, schema, 'params', kValidationParams)
    compileSchema.call(route, schema, 'query', kValidationQuery)
    compileSchema.call(route, schema, 'body', kValidationBody)
    compileSchema.call(route, schema, 'response', kValidationResponse)
  })
}

function onValidationFlow (next) {
  // const req = this[kRouteRequest]

  next()
}

module.exports = {
  onValidationFlow,
  attachValidation,
  buildAjvErrorsMsg
}
