import type { NextApiRequest, NextApiResponse } from 'next'
import * as jwt from './libs/jwt'

type Error = {
  status: 'error'
  message: jwt.Error
}

type Success = {
  status: 'success'
  body: {
    token: string
  }
}

type Result = Error | Success

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
): void {
  const token = jwt.get(req)
  if (token === null) {
    return res.status(400).json({ status: 'error', message: 'Unauthorised' })
  }
  const decoded = jwt.verify(token)

  if (typeof decoded === 'string') {
    return res.status(400).json({ status: 'error', message: decoded })
  }

  return res
    .status(200)
    .json({ status: 'success', body: { token: jwt.issue(decoded.address) } })
}
