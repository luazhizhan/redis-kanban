import { Client } from 'redis-om'
import env from './env'

const client = new Client()

export default async function connect(): Promise<Client> {
  if (client.isOpen()) return client
  await client.open(env.REDIS_CONNECTION_STRING)
  return client
}
