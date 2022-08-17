import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../libs/jwt'
import ItemRepository from '../repositories/Item'
import ItemOrderRepository from '../repositories/ItemOrder'

const BodyDecoder = JD.object({
  id: JD.string,
  category: JD.oneOf(['todo', 'doing', 'done']),
  content: JD.string,
  position: JD.integer,
})

type Error = {
  status: 'error'
  message: 'Invalid body' | 'Item order not found' | jwt.Error
}

type Success = {
  status: 'success'
  data: {
    id: string
  }
}

type Result = Error | Success

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
): Promise<void> {
  const token = jwt.get(req)
  if (token === null) {
    return res.status(400).json({ status: 'error', message: 'Unauthorised' })
  }
  const decoded = jwt.verify(token)
  if (typeof decoded === 'string') {
    return res.status(400).json({ status: 'error', message: decoded })
  }
  const decodedBody = BodyDecoder.value(req.body)
  if (!decodedBody) {
    return res.status(400).json({ status: 'error', message: 'Invalid body' })
  }

  /* Update item data by id */

  const itemRepository = await ItemRepository()
  const item = await itemRepository.fetch(decodedBody.id)
  const { category: newCategory, content, position } = decodedBody
  const now = new Date()
  const oldCategory = item.category
  item.category = newCategory
  item.content = content
  item.updatedAt = now

  /* Update item orders */

  const itemOrderRepository = await ItemOrderRepository()
  const itemOrders = await itemOrderRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .return.all()

  // Get old category item orders
  const oldOrder = itemOrders.find(({ category }) => category === oldCategory)
  if (!oldOrder) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Item order not found' })
  }

  // Get new category order. Create and save one if it doesn't exist
  const newOrder = await (async () => {
    const order = itemOrders.find(({ category }) => category === newCategory)
    if (order) return order
    return itemOrderRepository.createAndSave({
      address: decoded.address,
      category: newCategory,
      order: [],
    })
  })()

  // Remove item id from old order
  oldOrder.order = oldOrder.order.filter((id) => id !== decodedBody.id)

  // Determine if old and new order are the same category
  const updatingOrder = newCategory === oldCategory ? oldOrder : newOrder

  // Update new order by item id and position
  newOrder.order = [
    ...updatingOrder.order.slice(0, position),
    decodedBody.id,
    ...updatingOrder.order.slice(position),
  ]

  // Update database in sequence
  await itemRepository.save(item)
  await itemOrderRepository.save(oldOrder)
  await itemOrderRepository.save(newOrder)

  return res
    .status(200)
    .json({ status: 'success', data: { id: item.entityId } })
}
