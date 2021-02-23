const { default: AJV } = require('ajv')
const {
  kValidationParams,
  kValidationQuery,
  kValidationBody,

  kRouteRequest
} = require('./symbols')

function buildAjvErrorsMsg (errs) {
  const es = []
  errs.forEach(e => {
    es.push(`schema path: [${e.schemaPath}] message: ${e.message}`)
  })
  return es.join('\n')
}

function compileSchema (schema, field) {
  const {
    $smallify: { $options }
  } = this

  if (!schema) return

  const ajv = new AJV($options.ajv)
  this[field] = ajv.compile(schema)
}

function validateValue (validateFn, value) {
  if (!validateFn) return
  if (!validateFn(value)) {
    throw new Error(buildAjvErrorsMsg(validateFn.errors))
  }
}

function attachValidation () {
  this.addHook('onRoute', function (route) {
    const schema = route.schema
    if (!schema) return

    compileSchema.call(route, schema.params, kValidationParams)
    compileSchema.call(route, schema.query, kValidationQuery)
    compileSchema.call(route, schema.body, kValidationBody)
  })
}

function onValidationFlow (next) {
  const req = this[kRouteRequest]
  const schema = this.schema

  if (!schema) return next()

  try {
    validateValue.call(this, this[kValidationParams], req.params)
    validateValue.call(this, this[kValidationQuery], req.query)
    validateValue.call(this, this[kValidationBody], req.body)
    next()
  } catch (e) {
    next(e)
  }
}

module.exports = {
  onValidationFlow,
  attachValidation,
  buildAjvErrorsMsg,
  compileSchema,
  validateValue
}
