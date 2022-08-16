import useWallet from '../hooks/useWallet'
import styles from './ConnectButton.module.css'

const ConnectButton = (): JSX.Element => {
  const { wallet, onConnect } = useWallet()
  return (
    <button
      className={styles.connect}
      onClick={onConnect}
      disabled={wallet.status === 'connecting'}
    >
      {wallet.status === 'connecting' ? 'Connecting' : 'Connect MetaMask'}
    </button>
  )
}

export default ConnectButton
