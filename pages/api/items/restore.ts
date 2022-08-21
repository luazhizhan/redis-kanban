import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../../../libs/api/jwt'
import ItemRepository from '../../../libs/api/repositories/Item'
import ItemOrderRepository from '../../../libs/api/repositories/ItemOrder'

const BodyDecoder = JD.object({
  id: JD.string,
})

type Error = {
  status: 'error'
  message: 'Invalid body' | jwt.Error
}

type Success = {
  status: 'success'
  data: {
    item: {
      title: string
      id: string
      category: string
      content: string
    }
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

  const itemRepository = await ItemRepository()
  const item = await itemRepository.fetch(decodedBody.id)
  item.deleted = false
  item.updatedAt = new Date()
  await itemRepository.save(item)

  // Update item order
  const itemOrderRepository = await ItemOrderRepository()
  const itemOrder = await itemOrderRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .and('category')
    .equals(item.category)
    .return.first()

  if (itemOrder) {
    itemOrder.order = [item.entityId, ...itemOrder.order]
    await itemOrderRepository.save(itemOrder)
  }

  return res.status(200).json({
    status: 'success',
    data: {
      item: {
        title: item.title,
        id: item.entityId,
        category: item.category,
        content: item.content,
      },
    },
  })
}
