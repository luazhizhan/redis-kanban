import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from '../libs/jwt'
import ItemRepository from '../repositories/Item'

const BodyDecoder = JD.object({
  id: JD.string,
  category: JD.oneOf(['todo', 'doing', 'done']),
  content: JD.string,
})

type Error = {
  status: 'error'
  message: 'Invalid body' | jwt.Error
}

type Success = {
  status: 'success'
  body: {
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

  const itemRepository = await ItemRepository()
  const item = await itemRepository.fetch(decodedBody.id)
  const { category, content } = decodedBody
  const now = new Date()
  item.category = category
  item.content = content
  item.updatedAt = now
  await itemRepository.save(item)

  return res
    .status(200)
    .json({ status: 'success', body: { id: item.entityId } })
}
