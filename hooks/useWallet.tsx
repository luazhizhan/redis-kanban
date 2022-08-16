import * as JD from 'decoders'
import { useContext } from 'react'
import { Context } from '../store/Store'
import { Wallet } from '../store/wallet'
import useLocalStorage from './useLocalStorage'

const AccountsDecoder = JD.array(JD.string)
const LoginErrorDecoder = JD.object({
  status: JD.constant('error'),
  message: JD.oneOf(['Invalid body', 'Address mismatched']),
})
const LoginSuccessDecoder = JD.object({
  status: JD.constant('success'),
  body: JD.object({ token: JD.string }),
})
const LoginDecoder = JD.either(LoginErrorDecoder, LoginSuccessDecoder)
const RefreshSessionDecoder = JD.either(LoginErrorDecoder, LoginSuccessDecoder)

type Jwt = {
  address: string
  token: string
} | null

type Return = {
  wallet: Wallet
  refreshSession: () => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => void
}

const useWallet = (): Return => {
  const { state, dispatch } = useContext(Context)
  const [jwt, setJwt] = useLocalStorage<Jwt>('jwt', null)

  const refreshSession = async (): Promise<void> => {
    if (!jwt) return

    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jwt),
      })
      const data = await response.json()
      const decodedData = RefreshSessionDecoder.verify(data)
      if (decodedData.status === 'error') throw new Error(decodedData.message)
      setJwt({ address: jwt.address, token: decodedData.body.token })
      dispatch({
        type: 'SET_WALLET',
        wallet: { status: 'connected', account: jwt.address },
      })
    } catch (error) {
      setJwt(null)
    }
  }

  const onConnect = async (): Promise<void> => {
    if (state.wallet.status !== 'disconnected') return

    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return alert('Please install MetaMask')
    }
    try {
      dispatch({ type: 'SET_WALLET', wallet: { status: 'connecting' } })
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const decodedAccounts = AccountsDecoder.verify(accounts)
      const message = 'Login authentication message'
      const msg = `0x${Buffer.from(message).toString('hex')}`
      const [address] = decodedAccounts
      const signedMessage = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, address],
      })
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signedMessage,
        }),
      })
      const data = await response.json()
      const decodedData = LoginDecoder.verify(data)
      if (decodedData.status === 'error') throw new Error(decodedData.message)
      setJwt({ address, token: decodedData.body.token })
      dispatch({
        type: 'SET_WALLET',
        wallet: { status: 'connected', account: address },
      })
    } catch (error) {
      alert((error as { message: string }).message)
      dispatch({ type: 'SET_WALLET', wallet: { status: 'disconnected' } })
    }
  }

  const onDisconnect = (): void => {
    setJwt(null)
    dispatch({ type: 'SET_WALLET', wallet: { status: 'disconnected' } })
  }

  return { wallet: state.wallet, refreshSession, onConnect, onDisconnect }
}

export default useWallet
