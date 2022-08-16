import * as JD from 'decoders'
import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import env from './env'

const JWTDecoder = JD.object({ address: JD.string, exp: JD.number })

export type Error = 'Unauthorised' | 'Invalid JWT' | 'Expired JWT'
type JwtResult =
  | Error
  | {
      address: string
      exp: number
    }

export function get(req: NextApiRequest): string | null {
  const bearerToken = req.headers.authorization || ''
  const split = bearerToken.split('Bearer ')
  if (split.length !== 2) return null
  return split[1]
}

export function issue(address: string): string {
  const oneDayExpiry = Date.now() + 1000 * 60 * 60 * 24
  return jwt.sign({ address, exp: oneDayExpiry }, env.JWT_SECRET)
}

export function verify(token: string): JwtResult {
  const jwtResult = jwt.verify(token, env.JWT_SECRET)
  const decodedJwt = JWTDecoder.value(jwtResult)
  if (!decodedJwt) return 'Invalid JWT'
  if (decodedJwt.exp < Date.now()) return 'Expired JWT'
  return decodedJwt
}
