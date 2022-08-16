import * as JD from 'decoders'
import jwt from 'jsonwebtoken'
import env from './env'

const JWTDecoder = JD.object({ address: JD.string, exp: JD.number })
type VerifyResult = 'Invalid JWT' | 'Address mismatched' | 'Expired JWT' | null

export function issue(address: string): string {
  const oneDayExpiry = Date.now() + 1000 * 60 * 60 * 24
  return jwt.sign({ address, exp: oneDayExpiry }, env.JWT_SECRET)
}

export function verify(address: string, token: string): VerifyResult {
  const jwtResult = jwt.verify(token, env.JWT_SECRET)
  const decodedJwt = JWTDecoder.value(jwtResult)
  if (!decodedJwt) return 'Invalid JWT'
  if (decodedJwt.address !== address) return 'Address mismatched'
  if (decodedJwt.exp < Date.now()) return 'Expired JWT'
  return null
}
