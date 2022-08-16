import * as JD from 'decoders'
import type { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'
import * as jwt from './libs/jwt'

const BodyDecoder = JD.object({
  address: JD.string,
  message: JD.string,
  signedMessage: JD.string,
})

type Error = {
  status: 'error'
  message: 'Invalid body' | 'Address mismatched'
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
  const decodedBody = BodyDecoder.value(req.body)
  if (!decodedBody) {
    return res.status(400).json({ status: 'error', message: 'Invalid body' })
  }
  const { address, message, signedMessage } = decodedBody
  const web3 = new Web3(Web3.givenProvider)
  const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`
  const recoveredAddress = web3.eth.accounts.recover(msg, signedMessage)
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Address mismatched' })
  }

  return res
    .status(200)
    .json({ status: 'success', body: { token: jwt.issue(address) } })
}
