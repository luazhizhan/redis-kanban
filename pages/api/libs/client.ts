import { Client } from 'redis-om'
import env from './env'

export default async function client(): Promise<Client> {
  // Cache redis client connection
  if (global.client === undefined) {
    global.client = new Client()
  }
  if (!global.client.isOpen()) {
    await global.client.open(env.REDIS_CONNECTION_STRING)
  }
  return global.client
}
