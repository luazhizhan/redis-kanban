import { useContext, useEffect } from 'react'
import ConnectButton from '../../components/ConnectButton'
import useApi from '../../hooks/useApi'
import useWallet from '../../hooks/useWallet'
import { Context } from '../../store/Store'
import { Column } from './components/Column'
import EditModal from './components/EditModal'
import styles from './Index.module.css'

export default function Index(): JSX.Element {
  const { dispatch } = useContext(Context)
  const { wallet } = useWallet()
  const { allItems } = useApi()

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (wallet.status !== 'connected') return
      try {
        const data = await allItems()
        if (!data) return
        dispatch({ type: 'SET_ITEMS', allItems: data })
      } catch (error) {
        if (error instanceof Error) alert(error.message)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  if (wallet.status !== 'connected') {
    return (
      <div className={styles.container}>
        <section className={styles.connect}>
          <ConnectButton />
        </section>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <section className={styles.columns}>
        <Column category="todo" />
        <Column category="doing" />
        <Column category="done" />
      </section>
      <EditModal />
    </div>
  )
}
