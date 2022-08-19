import { Entity, Repository, Schema } from 'redis-om'
import Client from '../client'

interface ItemOrder {
  address: string
  category: string
  order: string[]
}

class ItemOrder extends Entity {}

const itemOrderSchema = new Schema(ItemOrder, {
  address: { type: 'string' },
  category: { type: 'string' },
  order: { type: 'string[]' },
})

export default async function repository(): Promise<Repository<ItemOrder>> {
  const client = await Client()
  const itemOrderRepository = client.fetchRepository(itemOrderSchema)
  await itemOrderRepository.createIndex()
  return itemOrderRepository
}
