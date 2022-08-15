import * as JD from 'decoders'
import { useContext } from 'react'
import { Context } from '../store/Store'
import { Wallet } from '../store/wallet'

const AccountsDecoder = JD.array(JD.string)
const MetaMaskErrorDecoder = JD.object({ code: JD.number, message: JD.string })

type Return = {
  wallet: Wallet
  onConnect: () => Promise<void>
  onDisconnect: () => void
}

const useWallet = (): Return => {
  const { state, dispatch } = useContext(Context)

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
      await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, decodedAccounts[0]],
      })
      dispatch({
        type: 'SET_WALLET',
        wallet: { status: 'connected', accounts: decodedAccounts },
      })
    } catch (error) {
      const decodedError = MetaMaskErrorDecoder.verify(error)
      alert(decodedError.message)
      dispatch({ type: 'SET_WALLET', wallet: { status: 'disconnected' } })
    }
  }

  const onDisconnect = (): void => {
    dispatch({ type: 'SET_WALLET', wallet: { status: 'disconnected' } })
  }

  return { wallet: state.wallet, onConnect, onDisconnect }
}

export default useWallet
