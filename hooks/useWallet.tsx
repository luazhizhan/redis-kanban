import * as JD from 'decoders'
import { useContext } from 'react'
import { Context } from '../store/Store'
import { Wallet } from '../store/wallet'
import useApi from './useApi'
import useJwt from './useJwt'

type Return = {
  wallet: Wallet
  refreshSession: () => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => void
}

const useWallet = (): Return => {
  const { state, dispatch } = useContext(Context)
  const [jwt, setJwt] = useJwt()
  const { login, refresh } = useApi()

  const refreshSession = async (): Promise<void> => {
    if (!jwt) return

    try {
      const updatedJwt = await refresh(jwt.token)
      setJwt({ address: jwt.address, token: updatedJwt })
      dispatch({
        type: 'SET_WALLET',
        wallet: { status: 'connected', account: jwt.address, jwt: updatedJwt },
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
      const decodedAccounts = JD.array(JD.string).verify(accounts)
      const message = 'Login authentication message'
      const msg = `0x${Buffer.from(message).toString('hex')}`
      const [address] = decodedAccounts
      const signedMessage = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, address],
      })
      const newJwt = await login(address, message, signedMessage as string)
      setJwt({ address, token: newJwt })

      dispatch({
        type: 'SET_WALLET',
        wallet: { status: 'connected', account: address, jwt: newJwt },
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
