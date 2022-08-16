import { Entity, Repository, Schema } from 'redis-om'
import Client from '../libs/client'

class Item extends Entity {}

const itemSchema = new Schema(Item, {
  address: { type: 'string' },
  content: { type: 'text' },
  category: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
})

export default async function repository(): Promise<Repository<Item>> {
  const client = await Client()
  const itemRepository = client.fetchRepository(itemSchema)
  await itemRepository.createIndex()
  return itemRepository
}
