import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import useApi, { ApiItem, Category } from '../../hooks/useApi'
import useHideOutsideClick from '../../hooks/useHideOutsideClick'
import useTheme from '../../hooks/useTheme'
import useWallet from '../../hooks/useWallet'
import { Context } from '../../store/Store'
import CloseIcon from '../svgs/Close'
import RestoreIcon from '../svgs/Restore'
import WalletIcon from '../svgs/Wallet'
import styles from './AccountModal.module.css'

type Props = {
  hide: boolean
  setHide: Dispatch<SetStateAction<boolean>>
  account: string
}
export default function AccountModal(props: Props): JSX.Element {
  const { dispatch } = useContext(Context)
  const { hide, setHide, account } = props
  const [isDarkTheme] = useTheme()
  const { onDisconnect } = useWallet()
  const { restoreItem, deletedItems } = useApi()
  const nextOffset = 5
  const [load, setLoad] = useState({ offset: 0, completed: false })
  const [items, setItems] = useState<ApiItem[]>([])
  const accountModalRef = useRef<HTMLDivElement>(null)
  useHideOutsideClick(accountModalRef, setHide)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hide) return setLoad({ offset: 0, completed: false })
    const getItems = async (): Promise<void> => {
      const data = await deletedItems(load.offset)
      if (data.length === 0) return setLoad({ ...load, completed: true })
      setItems(data)
      setLoad({ ...load, offset: load.offset + nextOffset })
    }
    getItems()
    listRef.current?.scrollTo(0, 0)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hide])

  const containerStyle = hide
    ? `${styles.container} ${styles.hide}`
    : `${styles.container} ${styles.show}`

  const categoryStyle = (category: Category): string => {
    switch (category) {
      case 'todo':
        return isDarkTheme ? '#4f4f4fb5' : '#e1e1e1b5'
      case 'doing':
        return isDarkTheme ? '#f37900b5' : '#ffbb35b5'
      case 'done':
        return isDarkTheme ? '#3fb98cb5' : '#7affceb5'
    }
  }

  const onRestoreClick = async (item: ApiItem): Promise<void> => {
    dispatch({ type: 'RESTORE_ITEM', item })
    setItems(items.filter((i) => i.id !== item.id))
    await restoreItem(item.id)
  }

  const onScroll = async (): Promise<void> => {
    if (load.completed) return
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      const isBottom = scrollTop + clientHeight - scrollHeight
      if (isBottom <= 1 && isBottom >= -1) {
        const data = await deletedItems(load.offset)
        if (data.length === 0) return setLoad({ ...load, completed: true })
        setItems(() => [...items, ...data])
        setLoad({ ...load, offset: load.offset + nextOffset })
      }
    }
  }

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
                height={18}
                width={18}
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

        {/* Deleted items */}
        <div className={items.length === 0 ? styles.hide : styles.items}>
          <span>Deleted Items</span>
          <div onScroll={onScroll} ref={listRef}>
            {items.map(({ id, category, content, title }: ApiItem) => (
              <div className={styles.item} key={id}>
                <div>
                  <span>{title}</span>
                  <span style={{ background: categoryStyle(category) }}>
                    {category}
                  </span>
                </div>
                <button
                  onClick={() =>
                    onRestoreClick({ id, category, content, title })
                  }
                >
                  <RestoreIcon
                    height={22}
                    width={22}
                    fill={isDarkTheme ? 'white' : '#484b4d'}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Deleted items footer */}
        <div className={items.length ? styles.hide : styles.deleted}>
          <p>Your deleted items will appear here...</p>
        </div>
      </div>
    </div>
  )
}
