import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../../../libs/api/jwt'
import ItemRepository from '../../../libs/api/repositories/Item'
import ItemOrderRepository from '../../../libs/api/repositories/ItemOrder'

const BodyDecoder = JD.object({
  id: JD.string,
  category: JD.oneOf(['todo', 'doing', 'done']),
})

type Error = {
  status: 'error'
  message: 'Invalid body' | jwt.Error
}

type Success = {
  status: 'success'
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
  await itemRepository.remove(decodedBody.id)

  // Update item orders
  const itemOrderRepository = await ItemOrderRepository()
  const itemOrder = await itemOrderRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .and('category')
    .equals(decodedBody.category)
    .return.first()

  if (itemOrder) {
    itemOrder.order = itemOrder.order.filter((id) => id !== decodedBody.id)
    await itemOrderRepository.save(itemOrder)
  }

  return res.status(200).json({ status: 'success' })
}
