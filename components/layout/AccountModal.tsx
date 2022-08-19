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
        <div className={styles.account}>
          <div>
            <WalletIcon
              height={28}
              width={28}
              fill={isDarkTheme ? 'white' : 'black'}
            />
            <span>{account}</span>
          </div>

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
  )
}
