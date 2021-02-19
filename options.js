const { default: AJV } = require('ajv')
const EnvSchema = require('env-schema')
const Merge = require('merge')
const path = require('path')

const ajv = new AJV({ useDefaults: true })

function fromUserConfig (opts) {
  const schema = require('./schemas/smallify-options.json')
  ajv.compile(schema)(opts)
  return opts
}

function fromEnvConfig () {
  const envVals = EnvSchema({
    dotenv: true,
    schema: require('./schemas/smallify-env-options.json')
  })

  const envOpts = {}
  for (const ek in envVals) {
    const segs = ek.toLowerCase().split('_')

    if (envOpts[segs[1]] === undefined) {
      envOpts[segs[1]] = {}
    }

    envOpts[segs[1]][segs[2]] = envVals[ek]
  }
  return envOpts
}

module.exports = function (opts) {
  // from user config
  opts = fromUserConfig(opts || {})
  // from environment
  const envOpts = fromEnvConfig()
  // merge options
  opts = Merge.recursive(opts, envOpts)

  // process special
  opts.pino.prettyPrint = opts.pino.pretty
  const cInfo = require(path.join(process.cwd(), 'package.json'))
  opts.pino.name = `[${cInfo.name}]`

  return opts
}
