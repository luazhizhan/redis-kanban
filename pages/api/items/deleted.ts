import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../../../libs/api/jwt'
import ItemRepository from '../../../libs/api/repositories/Item'

const BodyDecoder = JD.object({
  offset: JD.positiveInteger,
})

type Error = {
  status: 'error'
  message: 'Invalid body' | jwt.Error
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
  const itemQuery = await itemRepository
    .search()
    .where('address')
    .equals(decoded.address)
    .and('deleted')
    .equals(true)
    .sortDescending('updatedAt')
    .return.page(decodedBody.offset, 5)

  const items = itemQuery.map(({ entityId, category, title, content }) => ({
    id: entityId,
    category,
    title,
    content,
  }))

  return res.status(200).json({ status: 'success', data: { items } })
}
