import { Entity, Repository, Schema } from 'redis-om'
import Client from '../libs/client'

interface Item {
  address: string
  content: string
  category: string
  createdAt: Date
  updatedAt: Date
}

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
