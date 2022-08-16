import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../libs/jwt'
import ItemRepository from '../repositories/Item'

type Error = {
  status: 'error'
  message: 'Invalid data' | jwt.Error
}

type Success = {
  status: 'success'
  body: {
    data: { content: string; id: string; category: string }[]
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
  const items = await itemRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .return.all()

  const decodedItems = ItemsDecoder.value(items)
  if (!decodedItems) {
    return res.status(400).json({ status: 'error', message: 'Invalid data' })
  }
  const data = decodedItems.map(({ entityId, category, content }) => ({
    id: entityId,
    category,
    content,
  }))

  return res.status(200).json({ status: 'success', body: { data } })
}

const ItemsDecoder = JD.array(
  JD.object({ entityId: JD.string, content: JD.string, category: JD.string })
)
