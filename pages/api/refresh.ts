import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from './libs/jwt'

const BodyDecoder = JD.object({
  address: JD.string,
  token: JD.string,
})

type Error = {
  status: 'error'
  message: 'Invalid body' | 'Invalid JWT' | 'Address mismatched' | 'Expired JWT'
}

type Success = {
  status: 'success'
  body: {
    token: string
  }
}

type Return = Error | Success

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Return>
): void {
  const decodedBody = BodyDecoder.value(req.body)
  if (!decodedBody) {
    return res.status(400).json({ status: 'error', message: 'Invalid body' })
  }
  const { address, token } = decodedBody

  const message = jwt.verify(address, token)
  if (message !== null) {
    return res.status(400).json({ status: 'error', message })
  }

  return res
    .status(200)
    .json({ status: 'success', body: { token: jwt.issue(address) } })
}
