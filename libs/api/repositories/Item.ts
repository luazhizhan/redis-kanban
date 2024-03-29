import { Entity, Repository, Schema } from 'redis-om'
import Client from '../client'

interface Item {
  address: string
  title: string
  content: string
  category: string
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

class Item extends Entity {}

const itemSchema = new Schema(Item, {
  address: { type: 'string' },
  title: { type: 'text' },
  content: { type: 'text' },
  category: { type: 'string' },
  deleted: { type: 'boolean' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date', sortable: true },
})

export default async function repository(): Promise<Repository<Item>> {
  const client = await Client()
  const itemRepository = client.fetchRepository(itemSchema)
  await itemRepository.createIndex()
  return itemRepository
}
