import * as JD from 'decoders'

const env = JD.object({
  REDIS_CONNECTION_STRING: JD.string,
  JWT_SECRET: JD.string,
}).verify(process.env)

export default env
