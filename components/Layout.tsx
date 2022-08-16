import { useEffect, useState } from 'react'
import useWallet from '../hooks/useWallet'
import ConnectButton from './ConnectButton'
import styles from './Layout.module.css'
import MenuIcon from './svgs/Menu'
import UserCircleIcon from './svgs/UserCircle'

type Props = {
  children: JSX.Element
}

const Layout = (props: Props): JSX.Element => {
  const { children } = props
  const [open, isOpen] = useState(false)
  const { wallet, onDisconnect, refreshSession } = useWallet()

  const drawerStyle = open
    ? `${styles.drawer} ${styles.open}`
    : `${styles.drawer} ${styles.close}`

  const getDisplayAddress = (address: string): string =>
    `${address.substring(0, 10)}....${address.substring(address.length - 10)}`

  useEffect(() => {
    refreshSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.container}>
      <div className={drawerStyle}>
        {wallet.status === 'connected' ? (
          <button className={styles.connected} onClick={onDisconnect}>
            <UserCircleIcon height="22px" width="22px" />
            <span>{getDisplayAddress(wallet.account)}</span>
          </button>
        ) : (
          <ConnectButton />
        )}
      </div>
      <div className={styles.body}>
        <nav className={styles.nav}>
          <button onClick={() => isOpen(() => !open)}>
            <MenuIcon height={22} width={22} />
          </button>
          <h1>Redis Kanban</h1>
        </nav>
        <div className={styles.content}>{children} </div>
      </div>
    </div>
  )
}

export default Layout
