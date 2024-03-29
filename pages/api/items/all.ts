import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../../../libs/api/jwt'
import ItemRepository from '../../../libs/api/repositories/Item'
import ItemOrderRepository from '../../../libs/api/repositories/ItemOrder'

type Error = {
  status: 'error'
  message: jwt.Error
}

type Success = {
  status: 'success'
  data: {
    items: {
      title: string
      id: string
      category: string
      content: string
    }[]
    orders: Record<string, string[]>
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

  const itemRepository = await ItemRepository()
  const itemQuery = await itemRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .and('deleted')
    .equals(false)
    .return.all()

  const items = itemQuery.map(({ entityId, category, title, content }) => ({
    id: entityId,
    category,
    title,
    content,
  }))
  const itemOrderRepository = await ItemOrderRepository()
  const itemOrderQuery = await itemOrderRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .return.all()

  const orders = itemOrderQuery.reduce((prev, { category, order }) => {
    prev[category] = order
    return prev
  }, {} as Record<string, string[]>)

  return res.status(200).json({ status: 'success', data: { items, orders } })
}
