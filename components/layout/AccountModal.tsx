import { Dispatch, SetStateAction, useRef } from 'react'
import useHideOutsideClick from '../../hooks/useHideOutsideClick'
import useTheme from '../../hooks/useTheme'
import useWallet from '../../hooks/useWallet'
import CloseIcon from '../svgs/Close'
import WalletIcon from '../svgs/Wallet'
import styles from './AccountModal.module.css'

type Props = {
  hide: boolean
  setHide: Dispatch<SetStateAction<boolean>>
  account: string
}
export default function AccountModal(props: Props): JSX.Element {
  const { hide, setHide, account } = props
  const [isDarkTheme] = useTheme()
  const { onDisconnect } = useWallet()

  const accountModalRef = useRef<HTMLDivElement>(null)
  useHideOutsideClick(accountModalRef, setHide)

  const containerStyle = hide
    ? `${styles.container} ${styles.hide}`
    : `${styles.container} ${styles.show}`

  return (
    <div className={containerStyle}>
      <div className={styles.content} ref={accountModalRef}>
        {/* Account Information */}
        <div className={styles.accountInfo}>
          {/* Header */}
          <div className={styles.header}>
            <span>Account</span>
            <button onClick={() => setHide(true)}>
              <CloseIcon
                height={22}
                width={22}
                stroke={isDarkTheme ? 'white' : 'black'}
              />
            </button>
          </div>

          {/* Address */}
          <div className={styles.account}>
            <div className={styles.address}>
              <WalletIcon
                height={24}
                width={24}
                fill={isDarkTheme ? 'white' : 'black'}
              />
              <span>{account}</span>
            </div>
            <div className={styles.connected}>
              <span>Connected with MetaMask</span>
              <button
                onClick={() => {
                  onDisconnect()
                  setHide(true)
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Deleted cards */}
        <div className={styles.deleted}>
          <p>Your deleted cards will appear here...</p>
        </div>
      </div>
    </div>
  )
}
