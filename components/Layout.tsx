import Image from 'next/image'
import { useEffect } from 'react'
import useWallet from '../hooks/useWallet'
import ConnectButton from './ConnectButton'
import styles from './Layout.module.css'
import DotsVerticalIcon from './svgs/DotsVertical'
import WalletIcon from './svgs/Wallet'

type Props = {
  children: JSX.Element
}

const Layout = (props: Props): JSX.Element => {
  const { children } = props
  const { wallet, onDisconnect, refreshSession } = useWallet()

  const getDisplayAddress = (address: string): string =>
    `${address.substring(0, 7)}...${address.substring(address.length - 7)}`

  useEffect(() => {
    refreshSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <nav className={styles.nav}>
          <Image
            src={'/logo-light.svg'}
            width="70px"
            height="70px"
            alt="Redis Kanban"
          />
          <div>
            {wallet.status === 'connected' ? (
              <div className={styles.connected}>
                <WalletIcon height={20} width={20} />
                <button onClick={onDisconnect}>
                  <span>{getDisplayAddress(wallet.account)}</span>
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
            <button className={styles.menu}>
              <DotsVerticalIcon height={20} width={20} />
            </button>
          </div>
        </nav>
        <div className={styles.content}>{children} </div>
      </div>
    </div>
  )
}

export default Layout
